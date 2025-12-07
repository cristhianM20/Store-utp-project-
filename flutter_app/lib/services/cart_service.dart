import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/cart.dart';
import 'auth_service.dart';

class CartService {
  final AuthService _authService = AuthService();

  Future<Cart> getCart() async {
    final token = await _authService.getToken();
    final response = await http.get(
      Uri.parse('${ApiConfig.baseUrl}${ApiConfig.cartEndpoint}'),
      headers: ApiConfig.getHeaders(token: token),
    );

    if (response.statusCode == 200) {
      return Cart.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to load cart');
    }
  }

  Future<Cart> addToCart(int productId, int quantity) async {
    final token = await _authService.getToken();
    final response = await http.post(
      Uri.parse('${ApiConfig.baseUrl}${ApiConfig.addToCartEndpoint}'),
      headers: ApiConfig.getHeaders(token: token),
      body: jsonEncode({
        'productId': productId,
        'quantity': quantity,
      }),
    );

    if (response.statusCode == 200) {
      return Cart.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to add to cart');
    }
  }

  Future<Cart> removeFromCart(int productId) async {
    final token = await _authService.getToken();
    final response = await http.delete(
      Uri.parse('${ApiConfig.baseUrl}${ApiConfig.addToCartEndpoint}/$productId'),
      headers: ApiConfig.getHeaders(token: token),
    );

    if (response.statusCode == 200) {
      return Cart.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to remove from cart');
    }
  }
}
