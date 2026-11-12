import 'package:socket_io_client/socket_io_client.dart' as IO;
import '../constants/api_constants.dart';
import '../storage/secure_storage.dart';

class SocketService {
  IO.Socket? _socket;

  IO.Socket? get socket => _socket;

  Future<void> connect({String? customUrl}) async {
    final token = await SecureStorageService.getAccessToken();
    final url = customUrl ?? ApiConstants.defaultSocketUrl;

    _socket = IO.io(
      url,
      IO.OptionBuilder()
          .setTransports(['websocket', 'polling'])
          .enableAutoConnect()
          .enableReconnection()
          .setAuth({'token': token})
          .build(),
    );

    _socket?.onConnect((_) {
      print('📡 Android Flutter Socket Connected to $url');
    });

    _socket?.onDisconnect((reason) {
      print('Socket disconnected: $reason');
    });

    _socket?.onConnectError((data) {
      print('Socket connect error: $data');
    });
  }

  void disconnect() {
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
  }
}

