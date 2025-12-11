# EcommerceAI-Pro Backend 🛡️

API RESTful construida con **Spring Boot 3**, que sirve como núcleo lógico del sistema.

## 🌟 Características

- **Gestión de Usuarios**: Autenticación JWT, registro, roles (USER/ADMIN).
- **Gestión de Productos**: CRUD completo, carga de imágenes.
- **Carrito de Compras**: Lógica de negocio para pedidos.
- **Proxy de IA**: Centraliza y securiza las peticiones hacia el microservicio de IA.
- **Webhooks**: Integración con n8n para eventos de negocio.

## 🛠️ Stack Tecnológico

- **Java 17**
- **Spring Boot 3.2.x** (Web, Security, Data JPA)
- **PostgreSQL** (Driver)
- **Lombok** (Boilerplate reduction)
- **JJWT** (Token management)

## ⚙️ Configuración

### Ejecutar Localmente

```bash
# Usando Maven Wrapper
./mvnw clean spring-boot:run
```

El servidor iniciará en `http://localhost:8080`.

### Variables de Entorno Clave

Ver `src/main/resources/application.properties` para defaults.

- `SPRING_DATASOURCE_URL`: URL de conexión a BD.
- `JWT_SECRET`: Clave secreta para firmar tokens.
