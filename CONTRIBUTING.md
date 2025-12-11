# Contributing to EcommerceAI-Pro

Esta guía está diseñada para desarrolladores que desean contribuir, modificar o extender el proyecto EcommerceAI-Pro.

## 📋 Tabla de Contenidos

- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Stack Tecnológico](#stack-tecnológico)
- [Configuración del Entorno de Desarrollo](#configuración-del-entorno-de-desarrollo)
- [Guía de Modificación por Componente](#guía-de-modificación-por-componente)
- [Flujo de Datos](#flujo-de-datos)
- [API Endpoints](#api-endpoints)
- [Base de Datos](#base-de-datos)
- [Testing](#testing)
- [Convenciones de Código](#convenciones-de-código)

---

## 🏗️ Arquitectura del Sistema

### Diagrama de Arquitectura

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Frontend      │      │  Flutter App    │      │                 │
│   (Next.js)     │◄────►│   (Mobile)      │◄────►│   Backend       │
│   Port 3000     │      │                 │      │   (Spring Boot) │
└────────┬────────┘      └─────────────────┘      │   Port 8080     │
         │                                         └────────┬────────┘
         │                                                  │
         │                                         ┌────────▼────────┐
         │                                         │   PostgreSQL    │
         │                                         │   Port 5432     │
         │                                         └─────────────────┘
         │
         │               ┌─────────────────┐
         └──────────────►│   AI Service    │
                         │   (FastAPI)     │
                         │   Port 8000     │
                         └────────┬────────┘
                                  │
                         ┌────────▼────────┐
                         │     Ollama      │
                         │   Port 11435    │
                         └─────────────────┘

         ┌─────────────────┐
         │      n8n        │
         │  (Automation)   │
         │   Port 5678     │
         └─────────────────┘
```

### Comunicación entre Servicios

- **Frontend ↔ Backend**: REST API (HTTP/JSON)
- **Backend ↔ Database**: JDBC (PostgreSQL)
- **Frontend ↔ AI Service**: REST API (HTTP/JSON)
- **App (Voice) ↔ Backend ↔ AI Service**: Multipart Upload (Audio)
- **AI Service ↔ Ollama**: HTTP API
- **AI Service ↔ Whisper**: Local Library
- **AI Service ↔ Piper**: Subprocess Execution
- **Backend ↔ n8n**: Webhooks (HTTP POST)

---

## 📁 Estructura del Proyecto

```
EcommerceAI-Pro/
├── backend/                          # Spring Boot Backend
│   ├── src/main/java/com/ecommerceai/backend/
│   │   ├── config/                   # Configuraciones (Security, CORS)
│   │   ├── controller/               # REST Controllers
│   │   ├── dto/                      # Data Transfer Objects
│   │   ├── model/                    # Entidades JPA
│   │   ├── repository/               # Repositorios JPA
│   │   ├── security/                 # JWT, Filtros de seguridad
│   │   └── service/                  # Lógica de negocio
│   ├── src/main/resources/
│   │   └── application.properties    # Configuración de Spring
│   └── pom.xml                       # Dependencias Maven
│
├── frontend/                         # Next.js Frontend
│   ├── src/
│   │   ├── app/                      # App Router (Next.js 13+)
│   │   │   ├── admin/                # Panel de administración
│   │   │   ├── cart/                 # Carrito de compras
│   │   │   ├── dashboard/            # Dashboard del usuario
│   │   │   ├── login/                # Login
│   │   │   ├── products/             # Catálogo de productos
│   │   │   └── register/             # Registro
│   │   ├── components/               # Componentes reutilizables
│   │   │   ├── BiometricAuth.tsx     # Autenticación biométrica
│   │   │   └── ChatWidget.tsx        # Widget de chat IA
│   │   └── lib/                      # Utilidades y servicios
│   │       ├── auth.ts               # Funciones de autenticación
│   │       ├── chat.ts               # Cliente de chat IA
│   │       └── api.ts                # Cliente API
│   ├── .env.local                    # Variables de entorno
│   └── package.json                  # Dependencias npm
│
├── ai-service/                       # Python AI Service
│   ├── main.py                       # FastAPI app principal
│   ├── requirements.txt              # Dependencias Python
│   └── Dockerfile                    # Imagen Docker
│
├── flutter_app/                      # Flutter Mobile App
│   ├── lib/
│   │   ├── config/                   # Configuración API
│   │   ├── models/                   # Modelos de datos
│   │   ├── providers/                # State management
│   │   ├── screens/                  # Pantallas de la app
│   │   ├── services/                 # Servicios API
│   │   └── widgets/                  # Widgets reutilizables
│   └── pubspec.yaml                  # Dependencias Flutter
│
├── n8n-data/                         # Datos persistentes de n8n
│
├── docker-compose.yml                # Orquestación de servicios
└── README.md                         # Documentación principal
```

---

## 🛠️ Stack Tecnológico

### Backend
- **Framework**: Spring Boot 3.2.0
- **Lenguaje**: Java 17
- **Base de Datos**: PostgreSQL 15
- **ORM**: Spring Data JPA (Hibernate)
- **Seguridad**: Spring Security + JWT
- **Build Tool**: Maven

### Frontend Web
- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **HTTP Client**: Fetch API

### Mobile App
- **Framework**: Flutter 3.x
- **Lenguaje**: Dart
- **State Management**: Provider
- **HTTP Client**: http package

### AI Service
- **Framework**: FastAPI
- **Lenguaje**: Python 3.11
- **ML Libraries**: DeepFace, OpenCV, TensorFlow
- **LLM Engine**: Ollama (Qwen 2.5)

### Automation
- **Platform**: n8n
- **Workflows**: JSON-based

---

## ⚙️ Configuración del Entorno de Desarrollo

### Prerrequisitos

```bash
# Instalar Docker y Docker Compose
docker --version  # >= 20.10
docker-compose --version  # >= 1.29

# Para desarrollo local (opcional)
java --version    # >= 17
node --version    # >= 18
flutter --version # >= 3.0
python --version  # >= 3.11
```

### Variables de Entorno

#### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_AI_URL=http://localhost:8000
```

#### Backend (`backend/src/main/resources/application.properties`)
```properties
spring.datasource.url=jdbc:postgresql://postgres:5432/ecommerce
spring.datasource.username=postgres
spring.datasource.password=postgres
jwt.secret=your-secret-key-change-in-production
```

#### AI Service (variables en `docker-compose.yml`)
```yaml
OLLAMA_URL=http://ollama:11434
```

### Levantar el Entorno

```bash
# Levantar todos los servicios
docker-compose up -d --build

# Ver logs de un servicio específico
docker-compose logs -f backend

# Reconstruir un servicio
docker-compose build backend
docker-compose up -d backend
```

---

## 🔧 Guía de Modificación por Componente

### 1. Agregar un Nuevo Endpoint al Backend

**Archivo**: `backend/src/main/java/com/ecommerceai/backend/controller/`

```java
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    
    private final OrderRepository orderRepository;
    
    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        List<Order> orders = orderRepository.findAll();
        return ResponseEntity.ok(orders);
    }
    
    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody OrderDTO orderDTO) {
        // Lógica de creación
        Order order = orderService.createOrder(orderDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }
}
```

**Pasos**:
1. Crear la entidad en `model/Order.java`
2. Crear el repositorio en `repository/OrderRepository.java`
3. Crear el DTO en `dto/OrderDTO.java`
4. Crear el controller como arriba
5. Actualizar `SecurityConfig.java` si el endpoint requiere autenticación

### 2. Agregar una Nueva Página en Frontend

**Archivo**: `frontend/src/app/orders/page.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => setOrders(data));
  }, []);
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Mis Pedidos</h1>
      {/* Renderizar orders */}
    </div>
  );
}
```

**Pasos**:
1. Crear el directorio `frontend/src/app/orders/`
2. Crear `page.tsx` con el componente
3. Agregar link en la navegación (ej. `dashboard/page.tsx`)

### 3. Modificar el Modelo de IA

**Archivo**: `ai-service/main.py`

Para cambiar el modelo de Ollama:

```python
# Línea 21
MODEL_NAME = "llama2:7b"  # Cambiar de qwen2.5:7b a llama2

# Descargar el nuevo modelo
# docker exec ollama ollama pull llama2:7b
```

Para ajustar el prompt del sistema:

```python
# Línea 46-48
system_prompt = """Eres un asistente especializado en [TU DOMINIO].
Tus responsabilidades incluyen [LISTA DE TAREAS].
Siempre responde en [IDIOMA]."""
```

### 4. Agregar un Nuevo Workflow en n8n

1. Acceder a http://localhost:5678
2. Crear nuevo workflow
3. Agregar nodo "Webhook" con URL `/webhook/tu-evento`
4. Configurar nodos de procesamiento
5. Activar el workflow
6. En el backend, enviar POST a `http://n8n:5678/webhook/tu-evento`

**Ejemplo en Backend**:

```java
private void sendN8nWebhook(String eventType, Map<String, Object> data) {
    try {
        String url = "http://n8n:5678/webhook/" + eventType;
        restTemplate.postForEntity(url, data, String.class);
    } catch (Exception e) {
        log.error("Failed to send n8n webhook", e);
    }
}
```

### 5. Modificar la Base de Datos

**Opción 1: Agregar columna a entidad existente**

```java
// En model/Product.java
@Column(name = "rating")
private Double rating;

// Getters y setters
```

Spring Boot creará automáticamente la columna en desarrollo.

**Opción 2: Crear nueva tabla**

```java
@Entity
@Table(name = "reviews")
@Data
@Builder
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;
    
    private String comment;
    private Integer rating;
}
```

### 6. Agregar Autenticación a un Endpoint

**Archivo**: `backend/src/main/java/com/ecommerceai/backend/config/SecurityConfig.java`

```java
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/auth/**", "/health").permitAll()
            .requestMatchers("/api/admin/**").hasRole("ADMIN")  // Solo ADMIN
            .anyRequest().authenticated())  // Resto requiere auth
        // ...
    return http.build();
}
```

---

## 🔄 Flujo de Datos

### Flujo de Autenticación

```
1. Usuario → Frontend: Ingresa credenciales
2. Frontend → Backend: POST /api/auth/login
3. Backend → Database: Verifica usuario
4. Backend → Frontend: Retorna JWT token
5. Frontend: Guarda token en localStorage
6. Frontend → Backend: Requests con header "Authorization: Bearer {token}"
7. Backend: Valida token en JwtAuthenticationFilter
```

### Flujo de Chat IA

```
1. Usuario → Frontend: Escribe mensaje
2. Frontend → AI Service: POST /chat/generate {message, context}
3. AI Service → Ollama: POST /api/generate {prompt}
4. Ollama: Procesa con modelo Qwen 2.5
5. Ollama → AI Service: Retorna respuesta
6. AI Service → Frontend: {response}
7. Frontend: Muestra respuesta al usuario
```

### Flujo de Compra

```
1. Usuario → Frontend: Agrega producto al carrito
2. Frontend → Backend: POST /api/cart/add
3. Backend → Database: Guarda item en cart_items
4. Backend → n8n: Webhook "add-to-cart"
5. n8n: Ejecuta workflow (ej. email recordatorio)
```

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Login
- `POST /api/auth/register-face` - Registrar biometría
- `POST /api/auth/login-face` - Login con biometría

### Products
- `GET /api/products` - Listar productos
- `GET /api/products/{id}` - Obtener producto
- `POST /api/products` - Crear producto (requiere auth)
- `PUT /api/products/{id}` - Actualizar producto
- `DELETE /api/products/{id}` - Eliminar producto (soft delete)
- `POST /api/upload/image` - Subir imagen de producto (MultipartFile)

### Cart
- `GET /api/cart` - Obtener carrito del usuario
- `POST /api/cart/add` - Agregar item
- `DELETE /api/cart/items/{id}` - Eliminar item

### AI Service
- `POST /chat/generate` - Generar respuesta de chat
- `POST /biometrics/verify` - Verificar rostro

---

## 🗄️ Base de Datos

### Esquema Principal

```sql
-- Tabla de usuarios
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    biometric_data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de productos
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(500),
    category VARCHAR(100),
    stock INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true
);

-- Tabla de carrito
CREATE TABLE cart_items (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    product_id BIGINT REFERENCES products(id),
    quantity INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Acceder a la Base de Datos

```bash
# Conectarse al contenedor de PostgreSQL
docker exec -it ecommerceai-pro-postgres-1 psql -U postgres -d ecommerce

# Comandos útiles
\dt              # Listar tablas
\d users         # Describir tabla users
SELECT * FROM products LIMIT 10;
```

### Seeding (Datos de Prueba)

Para poblar la base de datos con productos de prueba (PCs y Accesorios), puedes usar el siguiente script SQL.

1. Crear un archivo `seed.sql`:

```sql
INSERT INTO products (name, description, price, discount_price, category, stock, active, image_url) VALUES
('Gaming PC Ultra X1', 'Intel Core i9 14900K, RTX 4090 24GB, 64GB DDR5 RAM, 2TB NVMe SSD. Liquid Cooled. The ultimate gaming machine.', 3999.99, 3499.99, 'PC', 10, true, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&q=80&w=600'),
('Workstation Pro', 'AMD Ryzen 9 7950X, 128GB RAM, 4TB SSD, Nvidia A4000. Perfect for 3D rendering and video editing.', 4500.00, NULL, 'PC', 5, true, 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&q=80&w=600'),
('Mini PC Home', 'Intel Core i5, 16GB RAM, 512GB SSD. Compact and silent for home office use.', 599.00, 499.00, 'PC', 50, true, 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=600'),
('Mechanical Keyboard RGB', 'Blue switches, customizable RGB lighting, aluminum frame. Tactile clicky feedback.', 89.99, 79.99, 'Accessories', 100, true, 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=600'),
('Wireless Gaming Mouse', '20000 DPI sensor, lightweight design, 8 programmable buttons. Ultra-low latency.', 59.99, NULL, 'Accessories', 200, true, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&q=80&w=600'),
('4K Monitor 27"', 'IPS Panel, 144Hz refresh rate, 1ms response time, HDR400. Stunning visuals.', 349.99, 299.99, 'Accessories', 30, true, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=600'),
('Noise Cancelling Headset', 'Active noise cancellation, 30hr battery life, crystal clear microphone.', 129.99, 89.99, 'Accessories', 75, true, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600');
```

2. Copiar y ejecutar en el contenedor de base de datos:

```bash
docker cp seed.sql $(docker-compose ps -q db):/tmp/seed.sql
docker-compose exec -T db psql -U dev -d ecomai -f /tmp/seed.sql
```

---

## 🧪 Testing

### Backend (JUnit)

```java
@SpringBootTest
class ProductControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    void shouldReturnAllProducts() throws Exception {
        mockMvc.perform(get("/api/products"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray());
    }
}
```

### Frontend (Jest)

```typescript
// __tests__/products.test.tsx
import { render, screen } from '@testing-library/react';
import ProductsPage from '@/app/products/page';

test('renders product list', () => {
  render(<ProductsPage />);
  expect(screen.getByText(/productos/i)).toBeInTheDocument();
});
```

### Ejecutar Tests

```bash
# Backend
cd backend
./mvnw test

# Frontend
cd frontend
npm test
```

---

## 📝 Convenciones de Código

### Java (Backend)
- **Nombres de clases**: PascalCase (`ProductController`)
- **Nombres de métodos**: camelCase (`getAllProducts`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_ITEMS`)
- **Paquetes**: lowercase (`com.ecommerceai.backend.controller`)

### TypeScript (Frontend)
- **Componentes**: PascalCase (`ChatWidget.tsx`)
- **Funciones**: camelCase (`sendMessage`)
- **Constantes**: UPPER_SNAKE_CASE (`API_URL`)
- **Archivos**: kebab-case para utilidades (`api-client.ts`)

### Python (AI Service)
- **Funciones**: snake_case (`generate_response`)
- **Clases**: PascalCase (`ChatRequest`)
- **Constantes**: UPPER_SNAKE_CASE (`MODEL_NAME`)

### Git Commits
```
feat: agregar endpoint de órdenes
fix: corregir error en autenticación biométrica
docs: actualizar README con nuevas instrucciones
refactor: optimizar consultas de productos
```

---

## 🚀 Deployment

### Producción

1. **Cambiar credenciales**:
   - JWT secret en `application.properties`
   - Contraseñas de PostgreSQL
   - Credenciales de n8n

2. **Configurar CORS**:
   ```java
   configuration.setAllowedOrigins(List.of("https://tu-dominio.com"));
   ```

3. **Build de producción**:
   ```bash
   # Frontend
   cd frontend && npm run build
   
   # Backend
   cd backend && ./mvnw clean package
   ```

4. **Variables de entorno**:
   - Usar variables de entorno en lugar de archivos `.env`
   - Configurar en tu plataforma de hosting

---

## 📞 Soporte

Para preguntas o problemas:
1. Revisar `TROUBLESHOOTING.md`
2. Consultar logs: `docker-compose logs -f [service]`
3. Abrir un issue en GitHub

---

## 📄 Licencia

MIT License - Ver `LICENSE` para más detalles.
