package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	jwt "github.com/dgrijalva/jwt-go"
	"golang.org/x/crypto/bcrypt"
)

// Configuración
var JWTSecret = []byte("ecommerce-ai-secret-key-2024")

// Modelos de datos
type User struct {
	ID       uint   `json:"id"`
	Email    string `json:"email"`
	Password string `json:"-"`
	Name     string `json:"name"`
	Role     string `json:"role"`
}

type Product struct {
	ID          uint    `json:"id"`
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Price       float64 `json:"price"`
	Stock       int     `json:"stock"`
	ImageURL    string  `json:"image_url"`
	Category    string  `json:"category"`
}

type CartItem struct {
	ProductID uint `json:"product_id"`
	Quantity  int  `json:"quantity"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

type Claims struct {
	UserID uint   `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.StandardClaims
}

// Base de datos simulada (en producción usar PostgreSQL)
var users = []User{
	{ID: 1, Email: "admin@utp.edu.co", Password: "$2a$10$y4pAwpqJ1hubSQJVwAUfo.8S8IBXhPtOj4774BxHxccu8HOfVdypC", Name: "Administrador", Role: "admin"},
}

var products = []Product{
	{ID: 1, Name: "Laptop Gamer", Description: "Laptop de alta gama para gaming", Price: 4500000, Stock: 10, ImageURL: "/images/laptop.jpg", Category: "Electrónica"},
	{ID: 2, Name: "Mouse Inalámbrico", Description: "Mouse ergonómico inalámbrico", Price: 150000, Stock: 50, ImageURL: "/images/mouse.jpg", Category: "Accesorios"},
	{ID: 3, Name: "Teclado Mecánico", Description: "Teclado mecánico RGB", Price: 350000, Stock: 30, ImageURL: "/images/keyboard.jpg", Category: "Accesorios"},
	{ID: 4, Name: "Monitor 27\"", Description: "Monitor 4K UHD", Price: 1200000, Stock: 15, ImageURL: "/images/monitor.jpg", Category: "Electrónica"},
	{ID: 5, Name: "Audífonos Bluetooth", Description: "Audífonos con cancelación de ruido", Price: 450000, Stock: 40, ImageURL: "/images/headphones.jpg", Category: "Audio"},
	{ID: 6, Name: "Webcam HD", Description: "Cámara web 1080p", Price: 280000, Stock: 25, ImageURL: "/images/webcam.jpg", Category: "Accesorios"},
}

// Middleware de autenticación
func authMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Token requerido", http.StatusUnauthorized)
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
			return JWTSecret, nil
		})

		if err != nil || !token.Valid {
			http.Error(w, "Token inválido", http.StatusUnauthorized)
			return
		}

		next(w, r)
	}
}

// Handlers
func loginHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Datos inválidos", http.StatusBadRequest)
		return
	}

	// Buscar usuario (en producción usar DB real)
	var user *User
	for _, u := range users {
		if u.Email == req.Email {
			user = &u
			break
		}
	}

	if user == nil {
		http.Error(w, "Usuario no encontrado", http.StatusUnauthorized)
		return
	}

	// Verificar password (hash simulado)
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		http.Error(w, "Contraseña incorrecta", http.StatusUnauthorized)
		return
	}

	// Generar JWT token
	claims := &Claims{
		UserID: user.ID,
		Email:  user.Email,
		Role:   user.Role,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: time.Now().Add(24 * time.Hour).Unix(),
			IssuedAt:  time.Now().Unix(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(JWTSecret)
	if err != nil {
		http.Error(w, "Error generando token", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(LoginResponse{Token: tokenString, User: *user})
}

func productsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	// Filtrar por categoría si existe
	category := r.URL.Query().Get("category")
	if category != "" {
		var filtered []Product
		for _, p := range products {
			if p.Category == category {
				filtered = append(filtered, p)
			}
		}
		json.NewEncoder(w).Encode(filtered)
		return
	}

	json.NewEncoder(w).Encode(products)
}

func productHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	// Obtener ID del producto de la URL
	parts := strings.Split(r.URL.Path, "/")
	if len(parts) < 3 {
		http.Error(w, "ID requerido", http.StatusBadRequest)
		return
	}

	var id uint
	fmt.Sscanf(parts[2], "%d", &id)

	for _, p := range products {
		if p.ID == id {
			json.NewEncoder(w).Encode(p)
			return
		}
	}

	http.Error(w, "Producto no encontrado", http.StatusNotFound)
}

func chatHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Message string `json:"message"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Datos inválidos", http.StatusBadRequest)
		return
	}

	// Respuesta simulada (en producción llamar al AI service)
	response := map[string]string{
		"response": fmt.Sprintf("Gracias por tu mensaje: '%s'. Nuestro asistente de IA te responderá pronto.", req.Message),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "healthy", "service": "go-backend"})
}

func main() {
	// Configurar routes
	http.HandleFunc("/api/auth/login", loginHandler)
	http.HandleFunc("/api/products", productsHandler)
	http.HandleFunc("/api/products/", authMiddleware(productHandler))
	http.HandleFunc("/api/chat", authMiddleware(chatHandler))
	http.HandleFunc("/api/health", healthHandler)

	// CORS middleware
	corsMiddleware := func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusOK)
				return
			}

			next.ServeHTTP(w, r)
		})
	}

	log.Println("🚀 Go Backend iniciado en :8080")
	log.Fatal(http.ListenAndServe(":8080", corsMiddleware(http.DefaultServeMux)))
}
