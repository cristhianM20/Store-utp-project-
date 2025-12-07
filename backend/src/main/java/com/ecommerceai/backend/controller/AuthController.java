package com.ecommerceai.backend.controller;

import com.ecommerceai.backend.dto.AuthenticationRequest;
import com.ecommerceai.backend.dto.AuthenticationResponse;
import com.ecommerceai.backend.dto.RegisterRequest;
import com.ecommerceai.backend.model.User;
import com.ecommerceai.backend.repository.UserRepository;
import com.ecommerceai.backend.security.JwtUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            if (repository.existsByEmail(request.getEmail())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Email already exists");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            var user = User.builder()
                    .fullName(request.getFullName())
                    .email(request.getEmail())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .role(User.Role.USER)
                    .build();

            repository.save(user);

            // Create UserDetails for token generation
            var userDetails = org.springframework.security.core.userdetails.User.builder()
                    .username(user.getEmail())
                    .password(user.getPassword())
                    .roles(user.getRole().name())
                    .build();

            var jwtToken = jwtUtils.generateToken(userDetails);
            return ResponseEntity.ok(AuthenticationResponse.builder().token(jwtToken).build());
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Registration failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticate(@Valid @RequestBody AuthenticationRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()));

            var user = repository.findByEmail(request.getEmail()).orElseThrow();

            var userDetails = org.springframework.security.core.userdetails.User.builder()
                    .username(user.getEmail())
                    .password(user.getPassword())
                    .roles(user.getRole().name())
                    .build();

            var jwtToken = jwtUtils.generateToken(userDetails);
            return ResponseEntity.ok(AuthenticationResponse.builder().token(jwtToken).build());
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Authentication failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    @lombok.Data
    static class BiometricLoginRequest {
        private String email;
        private String imageBase64;
    }

    @lombok.Data
    static class BiometricRegisterRequest {
        private String imageBase64;
    }

    @lombok.Data
    static class BiometricVerifyResponse {
        private boolean verified;
        private double distance;
        private String error;
    }

    private final org.springframework.web.client.RestTemplate restTemplate;

    @PostMapping("/biometric-login")
    public ResponseEntity<?> biometricLogin(@RequestBody BiometricLoginRequest request) {
        try {
            var user = repository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (user.getBiometricData() == null || user.getBiometricData().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Biometric data not registered for this user"));
            }

            // Call AI Service
            String aiServiceUrl = "http://ai-service:8000/biometrics/verify";
            Map<String, String> payload = new HashMap<>();
            payload.put("captured_image", request.getImageBase64());
            payload.put("stored_image", user.getBiometricData());

            var response = restTemplate.postForEntity(aiServiceUrl, payload, BiometricVerifyResponse.class);

            if (response.getBody() != null && response.getBody().isVerified()) {
                var userDetails = org.springframework.security.core.userdetails.User.builder()
                        .username(user.getEmail())
                        .password(user.getPassword())
                        .roles(user.getRole().name())
                        .build();

                var jwtToken = jwtUtils.generateToken(userDetails);
                return ResponseEntity.ok(AuthenticationResponse.builder().token(jwtToken).build());
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Face not recognized"));
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Biometric auth error: " + e.getMessage()));
        }
    }

    @PostMapping("/register-face")
    public ResponseEntity<?> registerFace(
            @RequestBody BiometricRegisterRequest request,
            org.springframework.security.core.Authentication authentication) {
        try {
            String email = authentication.getName();
            var user = repository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            user.setBiometricData(request.getImageBase64());
            repository.save(user);

            return ResponseEntity.ok(Map.of("message", "Face registered successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to register face: " + e.getMessage()));
        }
    }
}
