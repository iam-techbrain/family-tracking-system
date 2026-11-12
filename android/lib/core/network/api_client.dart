import 'package:dio/dio.dart';
import '../constants/api_constants.dart';
import '../storage/secure_storage.dart';

class ApiClient {
  late final Dio dio;

  ApiClient({String? baseUrl}) {
    dio = Dio(
      BaseOptions(
        baseUrl: baseUrl ?? ApiConstants.defaultBaseUrl,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 15),
        headers: {'Content-Type': 'application/json'},
      ),
    );

    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await SecureStorageService.getAccessToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (DioException error, handler) async {
          if (error.response?.statusCode == 401 &&
              !error.requestOptions.path.contains('/auth/login') &&
              !error.requestOptions.path.contains('/auth/refresh')) {
            final refreshToken = await SecureStorageService.getRefreshToken();
            if (refreshToken != null) {
              try {
                final refreshResponse = await dio.post(
                  ApiConstants.refresh,
                  data: {'refreshToken': refreshToken},
                );

                if (refreshResponse.statusCode == 200) {
                  final newAccess = refreshResponse.data['data']['accessToken'];
                  final newRefresh = refreshResponse.data['data']['refreshToken'];

                  await SecureStorageService.saveTokens(
                    accessToken: newAccess,
                    refreshToken: newRefresh,
                  );

                  error.requestOptions.headers['Authorization'] = 'Bearer $newAccess';
                  final retryResponse = await dio.fetch(error.requestOptions);
                  return handler.resolve(retryResponse);
                }
              } catch (_) {
                await SecureStorageService.clearAll();
              }
            }
          }
          return handler.next(error);
        },
      ),
    );
  }
}

