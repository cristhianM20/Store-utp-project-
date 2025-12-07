import 'product.dart';

class CartItem {
  final int id;
  final Product product;
  final int quantity;

  CartItem({
    required this.id,
    required this.product,
    required this.quantity,
  });

  factory CartItem.fromJson(Map<String, dynamic> json) {
    return CartItem(
      id: json['id'],
      product: Product.fromJson(json['product']),
      quantity: json['quantity'],
    );
  }

  double get total => product.price * quantity;
}

class Cart {
  final int id;
  final List<CartItem> items;
  final double total;

  Cart({
    required this.id,
    required this.items,
    required this.total,
  });

  factory Cart.fromJson(Map<String, dynamic> json) {
    var list = json['items'] as List;
    List<CartItem> itemsList = list.map((i) => CartItem.fromJson(i)).toList();

    return Cart(
      id: json['id'],
      items: itemsList,
      total: (json['total'] as num).toDouble(),
    );
  }
}
