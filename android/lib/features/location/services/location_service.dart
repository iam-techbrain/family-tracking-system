import 'dart:async';
import 'package:battery_plus/battery_plus.dart';
import 'package:geolocator/geolocator.dart';
import 'package:uuid/uuid.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/storage/offline_location_db.dart';
import '../../../../core/constants/api_constants.dart';

class LocationTrackingService {
  final ApiClient _apiClient;
  final Battery _battery = Battery();
  final Uuid _uuid = const Uuid();

  Timer? _periodicTimer;
  bool _isTracking = false;

  bool get isTracking => _isTracking;

  LocationTrackingService(this._apiClient);

  Future<bool> requestPermissions() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      return false;
    }

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        return false;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      return false;
    }

    return true;
  }

  Future<void> startTracking({int intervalMinutes = 5}) async {
    if (_isTracking) return;

    final hasPermission = await requestPermissions();
    if (!hasPermission) return;

    _isTracking = true;

    // Send immediate initial sample
    await _captureAndProcessLocation();

    // Schedule periodic timer targeting approximately 5 minutes
    _periodicTimer = Timer.periodic(
      Duration(minutes: intervalMinutes),
      (_) => _captureAndProcessLocation(),
    );
  }

  void stopTracking() {
    _periodicTimer?.cancel();
    _periodicTimer = null;
    _isTracking = false;
  }

  Future<void> _captureAndProcessLocation() async {
    try {
      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        timeLimit: const Duration(seconds: 15),
      );

      final batteryLevel = await _battery.batteryLevel;
      final batteryState = await _battery.batteryState;
      final isCharging = batteryState == BatteryState.charging ||
          batteryState == BatteryState.full;

      final eventId = _uuid.v4();
      final nowIso = DateTime.now().toUtc().toIso8601String();

      final queued = QueuedLocation(
        eventId: eventId,
        latitude: position.latitude,
        longitude: position.longitude,
        accuracy: position.accuracy,
        speed: position.speed,
        heading: position.heading,
        batteryPercentage: batteryLevel,
        isCharging: isCharging,
        gpsTimestamp: nowIso,
      );

      // 1. Try sending directly to backend
      try {
        await _apiClient.dio.post(
          ApiConstants.updateLocation,
          data: {
            'eventId': eventId,
            'latitude': position.latitude,
            'longitude': position.longitude,
            'accuracy': position.accuracy,
            'speed': position.speed,
            'heading': position.heading,
            'batteryPercentage': batteryLevel,
            'isCharging': isCharging,
            'gpsTimestamp': nowIso,
          },
        );

        // Also flush any pending queued locations if network is restored
        await _flushPendingQueue();
      } catch (uploadError) {
        // 2. On network failure or offline, enqueue in local SQLite
        await OfflineLocationDb.enqueue(queued);
      }
    } catch (_) {
      // Handle GPS transient failures safely without crash
    }
  }

  Future<void> _flushPendingQueue() async {
    final pending = await OfflineLocationDb.getPendingBatch(limit: 25);
    if (pending.isEmpty) return;

    try {
      final batchData = pending.map((l) => l.toMap()).toList();
      final response = await _apiClient.dio.post(
        ApiConstants.batchLocations,
        data: {'locations': batchData},
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final uploadedIds = pending.map((l) => l.eventId).toList();
        await OfflineLocationDb.removeUploaded(uploadedIds);
      }
    } catch (_) {
      // Keep in SQLite queue for next retry
    }
  }
}

