class CartItem {
  final int id;
  final int productId;
  final String productName;
  final double productPrice;
  final String? productImageUrl;
  final int quantity;
  final double subtotal;

  CartItem({
    required this.id,
    required this.productId,
    required this.productName,
    required this.productPrice,
    this.productImageUrl,
    required this.quantity,
    required this.subtotal,
  });

  factory CartItem.fromJson(Map<String, dynamic> json) {
    return CartItem(
      id: json['id'],
      productId: json['productId'],
      productName: json['productName'],
      productPrice: (json['productPrice'] as num).toDouble(),
      productImageUrl: json['productImageUrl'],
      quantity: json['quantity'],
      subtotal: (json['subtotal'] as num).toDouble(),
    );
  }
}

class Cart {
  final int id;
  final List<CartItem> items;
  final double totalPrice;

  Cart({
    required this.id,
    required this.items,
    required this.totalPrice,
  });

  factory Cart.fromJson(Map<String, dynamic> json) {
    var list = json['items'] as List? ?? [];
    List<CartItem> itemsList = list.map((i) => CartItem.fromJson(i)).toList();

    return Cart(
      id: json['id'],
      items: itemsList,
      totalPrice: (json['totalPrice'] as num).toDouble(),
    );
  }
}
