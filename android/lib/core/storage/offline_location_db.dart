import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class QueuedLocation {
  final String eventId;
  final double latitude;
  final double longitude;
  final double? accuracy;
  final double? speed;
  final double? heading;
  final int? batteryPercentage;
  final bool? isCharging;
  final String gpsTimestamp;

  QueuedLocation({
    required this.eventId,
    required this.latitude,
    required this.longitude,
    this.accuracy,
    this.speed,
    this.heading,
    this.batteryPercentage,
    this.isCharging,
    required this.gpsTimestamp,
  });

  Map<String, dynamic> toMap() {
    return {
      'event_id': eventId,
      'latitude': latitude,
      'longitude': longitude,
      'accuracy': accuracy,
      'speed': speed,
      'heading': heading,
      'battery_percentage': batteryPercentage,
      'is_charging': (isCharging == true) ? 1 : 0,
      'gps_timestamp': gpsTimestamp,
    };
  }

  factory QueuedLocation.fromMap(Map<String, dynamic> map) {
    return QueuedLocation(
      eventId: map['event_id'],
      latitude: map['latitude'],
      longitude: map['longitude'],
      accuracy: map['accuracy'],
      speed: map['speed'],
      heading: map['heading'],
      batteryPercentage: map['battery_percentage'],
      isCharging: map['is_charging'] == 1,
      gpsTimestamp: map['gps_timestamp'],
    );
  }
}

class OfflineLocationDb {
  static Database? _db;

  static Future<Database> get database async {
    if (_db != null) return _db!;
    _db = await _initDatabase();
    return _db!;
  }

  static Future<Database> _initDatabase() async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, 'family_circle_offline_locations.db');

    return await openDatabase(
      path,
      version: 1,
      onCreate: (db, version) async {
        await db.execute('''
          CREATE TABLE location_queue (
            event_id TEXT PRIMARY KEY,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            accuracy REAL,
            speed REAL,
            heading REAL,
            battery_percentage INTEGER,
            is_charging INTEGER,
            gps_timestamp TEXT NOT NULL
          )
        ''');
      },
    );
  }

  static Future<void> enqueue(QueuedLocation loc) async {
    final db = await database;
    await db.insert(
      'location_queue',
      loc.toMap(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );

    // Limit bounded queue size to 500 records to prevent storage exhaustion
    await db.rawDelete('''
      DELETE FROM location_queue WHERE event_id NOT IN (
        SELECT event_id FROM location_queue ORDER BY gps_timestamp DESC LIMIT 500
      )
    ''');
  }

  static Future<List<QueuedLocation>> getPendingBatch({int limit = 50}) async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'location_queue',
      orderBy: 'gps_timestamp ASC',
      limit: limit,
    );
    return maps.map((m) => QueuedLocation.fromMap(m)).toList();
  }

  static Future<void> removeUploaded(List<String> eventIds) async {
    if (eventIds.isEmpty) return;
    final db = await database;
    await db.delete(
      'location_queue',
      where: 'event_id IN (${List.filled(eventIds.length, '?').join(',')})',
      whereArgs: eventIds,
    );
  }
}

