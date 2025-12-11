import 'package:flutter/material.dart';
import '../models/cart.dart';
import '../services/cart_service.dart';

class CartProvider with ChangeNotifier {
  final CartService _cartService = CartService();
  Cart? _cart;
  bool _isLoading = false;
  String? _error;

  Cart? get cart => _cart;
  bool get isLoading => _isLoading;
  String? get error => _error;

  int get itemCount => _cart?.items.fold(0, (sum, item) => sum! + item.quantity) ?? 0;
  double get total => _cart?.totalPrice ?? 0.0;

  Future<void> fetchCart() async {
    _isLoading = true;
    notifyListeners();

    try {
      _cart = await _cartService.getCart();
      _error = null;
    } catch (e) {
      _error = e.toString().replaceAll('Exception: ', '');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> addToCart(int productId, int quantity) async {
    _isLoading = true;
    notifyListeners();

    try {
      _cart = await _cartService.addToCart(productId, quantity);
      _error = null;
    } catch (e) {
      _error = e.toString().replaceAll('Exception: ', '');
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> removeFromCart(int productId) async {
    _isLoading = true;
    notifyListeners();

    try {
      _cart = await _cartService.removeFromCart(productId);
      _error = null;
    } catch (e) {
      _error = e.toString().replaceAll('Exception: ', '');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
  
  void clearCart() {
    _cart = null;
    notifyListeners();
  }
}
