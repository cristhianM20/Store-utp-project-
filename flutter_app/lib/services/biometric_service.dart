import 'package:local_auth/local_auth.dart';
import 'package:flutter/services.dart';

class BiometricService {
  final LocalAuthentication _localAuth = LocalAuthentication();

  /// Check if the device supports biometric authentication
  Future<bool> isBiometricAvailable() async {
    try {
      return await _localAuth.canCheckBiometrics;
    } on PlatformException {
      return false;
    }
  }

  /// Check if device has biometrics enrolled (fingerprint/face registered)
  Future<bool> hasBiometricsEnrolled() async {
    try {
      final isAvailable = await isBiometricAvailable();
      if (!isAvailable) return false;

      final availableBiometrics = await _localAuth.getAvailableBiometrics();
      return availableBiometrics.isNotEmpty;
    } on PlatformException {
      return false;
    }
  }

  /// Get list of available biometric types
  Future<List<BiometricType>> getAvailableBiometrics() async {
    try {
      return await _localAuth.getAvailableBiometrics();
    } on PlatformException {
      return [];
    }
  }

  /// Authenticate user with biometrics (fingerprint/face)
  Future<bool> authenticate({
    String localizedReason = 'Por favor autentícate para continuar',
  }) async {
    try {
      final isAvailable = await isBiometricAvailable();
      if (!isAvailable) {
        print('Biometric not available on device');
        return false;
      }

      final hasEnrolled = await hasBiometricsEnrolled();
      if (!hasEnrolled) {
        print('No biometrics enrolled on device');
        return false;
      }

      print('Attempting biometric authentication...');
      final result = await _localAuth.authenticate(
        localizedReason: localizedReason,
        options: const AuthenticationOptions(
          stickyAuth: true,
          biometricOnly: true,
        ),
      );
      print('Biometric authentication result: $result');
      return result;
    } on PlatformException catch (e) {
      print('Biometric authentication PlatformException: ${e.code} - ${e.message}');
      return false;
    } catch (e) {
      print('Biometric authentication error: $e');
      return false;
    }
  }

  /// Check if biometric authentication is supported and enrolled
  Future<bool> canUseBiometric() async {
    final isAvailable = await isBiometricAvailable();
    final hasEnrolled = await hasBiometricsEnrolled();
    return isAvailable && hasEnrolled;
  }
}
