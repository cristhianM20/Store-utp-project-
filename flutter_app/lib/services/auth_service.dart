import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../config/api_config.dart';
import '../models/user.dart';

class AuthService {
  final storage = const FlutterSecureStorage();
  static const String tokenKey = 'auth_token';

  Future<AuthResponse> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('${ApiConfig.baseUrl}${ApiConfig.loginEndpoint}'),
      headers: ApiConfig.getHeaders(),
      body: jsonEncode({
        'email': email,
        'password': password,
      }),
    );

    if (response.statusCode == 200) {
      final authResponse = AuthResponse.fromJson(jsonDecode(response.body));
      await saveToken(authResponse.token);
      return authResponse;
    } else {
      final error = jsonDecode(response.body);
      throw Exception(error['error'] ?? 'Login failed');
    }
  }

  Future<AuthResponse> register({
    required String email,
    required String password,
    required String fullName,
  }) async {
    final response = await http.post(
      Uri.parse('${ApiConfig.baseUrl}${ApiConfig.registerEndpoint}'),
      headers: ApiConfig.getHeaders(),
      body: jsonEncode({
        'email': email,
        'password': password,
        'fullName': fullName,
      }),
    );

    if (response.statusCode == 200) {
      final authResponse = AuthResponse.fromJson(jsonDecode(response.body));
      await saveToken(authResponse.token);
      return authResponse;
    } else {
      final error = jsonDecode(response.body);
      throw Exception(error['error'] ?? 'Registration failed');
    }
  }

  Future<void> saveToken(String token) async {
    await storage.write(key: tokenKey, value: token);
  }

  Future<String?> getToken() async {
    return await storage.read(key: tokenKey);
  }

  Future<void> logout() async {
    await storage.delete(key: tokenKey);
  }

  Future<bool> isAuthenticated() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }

  // Biometric Authentication Methods
  static const String biometricEnabledKey = 'biometric_enabled';
  static const String biometricEmailKey = 'biometric_email';
  static const String biometricPasswordKey = 'biometric_password';

  /// Enable biometric authentication by storing credentials
  Future<void> enableBiometric(String email, String password) async {
    await storage.write(key: biometricEnabledKey, value: 'true');
    await storage.write(key: biometricEmailKey, value: email);
    await storage.write(key: biometricPasswordKey, value: password);
  }

  /// Disable biometric authentication and clear stored credentials
  Future<void> disableBiometric() async {
    await storage.delete(key: biometricEnabledKey);
    await storage.delete(key: biometricEmailKey);
    await storage.delete(key: biometricPasswordKey);
  }

  /// Check if biometric authentication is enabled
  Future<bool> isBiometricEnabled() async {
    final enabled = await storage.read(key: biometricEnabledKey);
    return enabled == 'true';
  }

  /// Get stored biometric email
  Future<String?> getBiometricEmail() async {
    return await storage.read(key: biometricEmailKey);
  }

  /// Login with stored biometric credentials
  Future<AuthResponse> loginWithBiometric() async {
    final email = await storage.read(key: biometricEmailKey);
    final password = await storage.read(key: biometricPasswordKey);

    if (email == null || password == null) {
      throw Exception('No biometric credentials stored');
    }

    return await login(email, password);
  }
}
