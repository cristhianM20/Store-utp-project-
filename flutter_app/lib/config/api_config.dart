import 'package:shared_preferences/shared_preferences.dart';

class ApiConfig {
  static const String _defaultHost = 'http://10.0.2.2:8080';
  static String _host = _defaultHost;
  
  static String get host => _host;
  static String get baseUrl => '$_host/api';
  // Asumimos que AI service corre en puerto diferente o misma IP
  // Para simplificar, asumiremos que si cambias la IP, todo cambia
  static String get aiUrl => _host.replaceAll('8080', '8000'); 

  static Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    _host = prefs.getString('api_host') ?? _defaultHost;
  }

  static Future<void> setHost(String newHost) async {
    // Asegurar que no termine en slash
    if (newHost.endsWith('/')) {
        newHost = newHost.substring(0, newHost.length - 1);
    }
    
    // Asegurar http/https
    if (!newHost.startsWith('http')) {
        newHost = 'http://$newHost';
    }

    _host = newHost;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('api_host', _host);
  }

  static String getImageUrl(String? path) {
    if (path == null || path.isEmpty) return '';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/')) return '$_host$path';
    return '$_host/$path';
  }
  
  // Endpoints
  static const String loginEndpoint = '/auth/login';
  static const String registerEndpoint = '/auth/register';
  static const String biometricLoginEndpoint = '/auth/biometric-login';
  
  static const String productsEndpoint = '/products';
  static const String searchProductsEndpoint = '/products/search';
  
  static const String cartEndpoint = '/cart';
  static const String addToCartEndpoint = '/cart/items';
  
  static const String chatEndpoint = '/chat/generate';
  static const String chatVoiceEndpoint = '/chat/voice';
  
  // HTTP Headers
  static Map<String, String> getHeaders({String? token}) {
    final headers = {
      'Content-Type': 'application/json',
    };
    
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }
    
    return headers;
  }
}
