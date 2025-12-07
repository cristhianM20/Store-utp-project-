import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../config/api_config.dart';
import 'auth_service.dart';

class ChatService {
  final AuthService _authService = AuthService();

  Future<String> sendMessage(String message, {String context = ''}) async {
    final token = await _authService.getToken();
    
    // Nota: Ajusta el endpoint según tu backend. 
    // Si usas el endpoint directo de Python: ApiConfig.aiUrl + '/chat'
    // Si usas el proxy de Spring Boot (recomendado): ApiConfig.baseUrl + '/chat/generate'
    
    // Asumiendo que usamos el backend de Spring Boot como proxy o el endpoint directo definido en ApiConfig
    final url = Uri.parse('${ApiConfig.baseUrl}${ApiConfig.chatEndpoint}');

    try {
      final response = await http.post(
        url,
        headers: ApiConfig.getHeaders(token: token),
        body: jsonEncode({
          'prompt': message,
          'context': context,
        }),
      );

      if (response.statusCode == 200) {
        // Asumiendo que el backend devuelve texto plano o un JSON con campo 'response'
        // Ajusta según la respuesta real de tu backend
        try {
          final data = jsonDecode(response.body);
          return data['response'] ?? data['content'] ?? response.body;
        } catch (e) {
          return response.body;
        }
      } else {
        throw Exception('Failed to send message: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error connecting to chat service: $e');
    }
  }
}
