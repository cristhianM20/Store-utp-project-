class ApiConfig {
  // Para emulador Android usa 10.0.2.2 (localhost del host)
  // Para iOS simulator usa localhost
  // Para dispositivo físico usa la IP de tu computadora en la red local
  
  static const String host = 'http://10.0.2.2:8080';
  static const String baseUrl = '$host/api';
  static const String aiUrl = 'http://10.0.2.2:8000';

  static String getImageUrl(String? path) {
    if (path == null || path.isEmpty) return '';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/')) return '$host$path';
    return '$host/$path';
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
