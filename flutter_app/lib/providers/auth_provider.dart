import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../services/biometric_service.dart';

class AuthProvider with ChangeNotifier {
  final AuthService _authService = AuthService();
  final BiometricService _biometricService = BiometricService();
  
  bool _isAuthenticated = false;
  bool _isLoading = false;
  String? _error;
  bool _isBiometricAvailable = false;
  bool _isBiometricEnabled = false;

  bool get isAuthenticated => _isAuthenticated;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isBiometricAvailable => _isBiometricAvailable;
  bool get isBiometricEnabled => _isBiometricEnabled;

  AuthProvider() {
    _checkAuthStatus();
    _checkBiometricAvailability();
  }

  Future<void> _checkAuthStatus() async {
    _isAuthenticated = await _authService.isAuthenticated();
    _isBiometricEnabled = await _authService.isBiometricEnabled();
    notifyListeners();
  }

  Future<void> _checkBiometricAvailability() async {
    _isBiometricAvailable = await _biometricService.canUseBiometric();
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await _authService.login(email, password);
      _isAuthenticated = true;
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString().replaceAll('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> register({
    required String email,
    required String password,
    required String fullName,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await _authService.register(
        email: email,
        password: password,
        fullName: fullName,
      );
      _isAuthenticated = true;
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString().replaceAll('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await _authService.logout();
    _isAuthenticated = false;
    _isBiometricEnabled = false;
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }

  // Biometric Authentication Methods

  /// Enable biometric authentication after successful login
  Future<bool> enableBiometric(String email, String password) async {
    try {
      final canUse = await _biometricService.canUseBiometric();
      if (!canUse) {
        _error = 'Biometric authentication not available on this device';
        notifyListeners();
        return false;
      }

      await _authService.enableBiometric(email, password);
      _isBiometricEnabled = true;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  /// Disable biometric authentication
  Future<void> disableBiometric() async {
    await _authService.disableBiometric();
    _isBiometricEnabled = false;
    notifyListeners();
  }

  /// Login with biometric authentication (fingerprint/face)
  Future<bool> loginWithBiometric() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // First authenticate with biometric
      final authenticated = await _biometricService.authenticate(
        localizedReason: 'Autentícate para iniciar sesión',
      );

      if (!authenticated) {
        _error = 'Autenticación biométrica fallida';
        _isLoading = false;
        notifyListeners();
        return false;
      }

      // Then login with stored credentials
      await _authService.loginWithBiometric();
      _isAuthenticated = true;
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString().replaceAll('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }
}
