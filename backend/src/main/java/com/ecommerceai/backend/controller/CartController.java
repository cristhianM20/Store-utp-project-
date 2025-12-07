package com.ecommerceai.backend.controller;

import com.ecommerceai.backend.dto.CartDTO;
import com.ecommerceai.backend.model.Cart;
import com.ecommerceai.backend.model.CartItem;
import com.ecommerceai.backend.model.Product;
import com.ecommerceai.backend.model.User;
import com.ecommerceai.backend.repository.CartRepository;
import com.ecommerceai.backend.repository.ProductRepository;
import com.ecommerceai.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

        private final CartRepository cartRepository;
        private final ProductRepository productRepository;
        private final UserRepository userRepository;
        private final org.springframework.web.client.RestTemplate restTemplate;

        @PostMapping("/items")
        public ResponseEntity<CartDTO> addToCart(
                        @RequestParam Long productId,
                        @RequestParam Integer quantity,
                        Authentication authentication) {

                User user = getUserFromAuthentication(authentication);
                Cart cart = cartRepository.findByUser(user)
                                .orElseGet(() -> createNewCart(user));

                Product product = productRepository.findById(productId)
                                .orElseThrow(() -> new RuntimeException("Product not found"));

                // Check if item already exists
                CartItem existingItem = cart.getItems().stream()
                                .filter(item -> item.getProduct().getId().equals(productId))
                                .findFirst()
                                .orElse(null);

                if (existingItem != null) {
                        existingItem.setQuantity(existingItem.getQuantity() + quantity);
                } else {
                        CartItem newItem = CartItem.builder()
                                        .cart(cart)
                                        .product(product)
                                        .quantity(quantity)
                                        .build();
                        cart.getItems().add(newItem);
                }

                cart.setUpdatedAt(LocalDateTime.now());
                Cart savedCart = cartRepository.save(cart);

                // Send webhook to n8n
                sendN8nWebhook(user, product, quantity);

                return ResponseEntity.ok(convertToDTO(savedCart));
        }

        private void sendN8nWebhook(User user, Product product, Integer quantity) {
                try {
                        String n8nUrl = "http://n8n:5678/webhook/add-to-cart";
                        java.util.Map<String, Object> payload = new java.util.HashMap<>();
                        payload.put("userId", user.getId());
                        payload.put("userEmail", user.getEmail());
                        payload.put("productId", product.getId());
                        payload.put("productName", product.getName());
                        payload.put("quantity", quantity);
                        payload.put("timestamp", LocalDateTime.now().toString());

                        restTemplate.postForEntity(n8nUrl, payload, String.class);
                } catch (Exception e) {
                        // Log but don't fail the cart operation
                        System.err.println("Failed to send n8n webhook: " + e.getMessage());
                }
        }

        @PutMapping("/items/{itemId}")
        public ResponseEntity<CartDTO> updateCartItem(
                        @PathVariable Long itemId,
                        @RequestParam Integer quantity,
                        Authentication authentication) {

                User user = getUserFromAuthentication(authentication);
                Cart cart = cartRepository.findByUser(user)
                                .orElseThrow(() -> new RuntimeException("Cart not found"));

                CartItem item = cart.getItems().stream()
                                .filter(i -> i.getId().equals(itemId))
                                .findFirst()
                                .orElseThrow(() -> new RuntimeException("Item not found"));

                item.setQuantity(quantity);
                cart.setUpdatedAt(LocalDateTime.now());
                Cart savedCart = cartRepository.save(cart);
                return ResponseEntity.ok(convertToDTO(savedCart));
        }

        @DeleteMapping("/items/{itemId}")
        public ResponseEntity<CartDTO> removeFromCart(
                        @PathVariable Long itemId,
                        Authentication authentication) {

                User user = getUserFromAuthentication(authentication);
                Cart cart = cartRepository.findByUser(user)
                                .orElseThrow(() -> new RuntimeException("Cart not found"));

                cart.getItems().removeIf(item -> item.getId().equals(itemId));
                cart.setUpdatedAt(LocalDateTime.now());
                Cart savedCart = cartRepository.save(cart);
                return ResponseEntity.ok(convertToDTO(savedCart));
        }

        @DeleteMapping
        public ResponseEntity<Void> clearCart(Authentication authentication) {
                User user = getUserFromAuthentication(authentication);
                Cart cart = cartRepository.findByUser(user)
                                .orElseThrow(() -> new RuntimeException("Cart not found"));

                cart.getItems().clear();
                cart.setUpdatedAt(LocalDateTime.now());
                cartRepository.save(cart);
                return ResponseEntity.ok().build();
        }

        private User getUserFromAuthentication(Authentication authentication) {
                String email = authentication.getName();
                return userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));
        }

        private Cart createNewCart(User user) {
                Cart cart = Cart.builder()
                                .user(user)
                                .build();
                return cartRepository.save(cart);
        }

        private CartDTO convertToDTO(Cart cart) {
                return CartDTO.builder()
                                .id(cart.getId())
                                .items(cart.getItems().stream()
                                                .map(this::convertItemToDTO)
                                                .collect(Collectors.toList()))
                                .totalPrice(cart.getTotalPrice())
                                .build();
        }

        private CartDTO.CartItemDTO convertItemToDTO(CartItem item) {
                return CartDTO.CartItemDTO.builder()
                                .id(item.getId())
                                .productId(item.getProduct().getId())
                                .productName(item.getProduct().getName())
                                .productPrice(item.getProduct().getPrice())
                                .productImageUrl(item.getProduct().getImageUrl())
                                .quantity(item.getQuantity())
                                .subtotal(item.getSubtotal())
                                .build();
        }

        @GetMapping
        public ResponseEntity<CartDTO> getCart(Authentication authentication) {
                User user = getUserFromAuthentication(authentication);
                Cart cart = cartRepository.findByUser(user)
                                .orElseGet(() -> createNewCart(user));
                return ResponseEntity.ok(convertToDTO(cart));
        }
}