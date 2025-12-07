import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/user.dart';
import 'auth_service.dart';

class BiometricService {
  final AuthService _authService = AuthService();

  Future<bool> registerFace(File imageFile) async {
    final token = await _authService.getToken();
    
    // Convertir imagen a Base64
    List<int> imageBytes = await imageFile.readAsBytes();
    String base64Image = base64Encode(imageBytes);
    
    // Asegurarse de que tenga el prefijo correcto si el backend lo espera
    if (!base64Image.startsWith('data:image')) {
      base64Image = 'data:image/jpeg;base64,$base64Image';
    }

    final response = await http.post(
      Uri.parse('${ApiConfig.baseUrl}/auth/register-face'),
      headers: ApiConfig.getHeaders(token: token),
      body: jsonEncode({
        'image': base64Image,
      }),
    );

    if (response.statusCode == 200) {
      return true;
    } else {
      throw Exception('Failed to register face: ${response.body}');
    }
  }

  Future<AuthResponse> loginWithFace(File imageFile) async {
    // Convertir imagen a Base64
    List<int> imageBytes = await imageFile.readAsBytes();
    String base64Image = base64Encode(imageBytes);
    
    if (!base64Image.startsWith('data:image')) {
      base64Image = 'data:image/jpeg;base64,$base64Image';
    }

    final response = await http.post(
      Uri.parse('${ApiConfig.baseUrl}${ApiConfig.biometricLoginEndpoint}'),
      headers: ApiConfig.getHeaders(),
      body: jsonEncode({
        'image': base64Image,
      }),
    );

    if (response.statusCode == 200) {
      final authResponse = AuthResponse.fromJson(jsonDecode(response.body));
      await _authService.saveToken(authResponse.token);
      return authResponse;
    } else {
      throw Exception('Biometric login failed: ${response.body}');
    }
  }
}
