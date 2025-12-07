package com.ecommerceai.backend.repository;

import com.ecommerceai.backend.model.Cart;
import com.ecommerceai.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findByUser(User user);
}
