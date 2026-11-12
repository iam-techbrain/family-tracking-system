class ApiConstants {
  // Use 10.0.2.2 for Android emulator localhost, or your server's LAN/public IP
  static const String defaultBaseUrl = 'http://10.0.2.2:4000/api/v1';
  static const String defaultSocketUrl = 'http://10.0.2.2:4000';

  // Auth endpoints
  static const String register = '/auth/register';
  static const String login = '/auth/login';
  static const String refresh = '/auth/refresh';
  static const String logout = '/auth/logout';
  static const String me = '/auth/me';

  // User endpoints
  static const String userProfile = '/users/me';
  static const String userSettings = '/users/me/settings';

  // Family endpoints
  static const String families = '/families';
  static const String joinFamily = '/families/join';

  // Location endpoints
  static const String updateLocation = '/locations';
  static const String batchLocations = '/locations/batch';
  static const String locationSharing = '/location-sharing';

  // SOS endpoints
  static const String sos = '/sos';
}

