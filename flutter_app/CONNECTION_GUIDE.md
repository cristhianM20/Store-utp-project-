# Conexión Flutter App → Backend

## Arquitectura

```
┌─────────────────┐
│  Flutter App    │
│  (Android/iOS)  │
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐
│  Backend        │
│  Spring Boot    │
│  :8080          │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│  DB    │ │  AI    │
│  :5432 │ │  :8000 │
└────────┘ └────────┘
```

## URLs de Conexión

La app Flutter se conecta vía:

### Android Emulador
```dart
// 10.0.2.2 = localhost de la máquina host
static const String baseUrl = 'http://10.0.2.2:8080/api';
static const String aiUrl = 'http://10.0.2.2:8000';
```

### iOS Simulator  
```dart
static const String baseUrl = 'http://localhost:8080/api';
static const String aiUrl = 'http://localhost:8000';
```

### Dispositivo Físico
```dart
// Usa la IP de tu computadora en la red local
static const String baseUrl = 'http://192.168.1.X:8080/api';
static const String aiUrl = 'http://192.168.1.X:8000';
```

## Flujo de Autenticación

1. **Usuario abre la app** → Splash Screen
2. **App verifica token** → Llama a `AuthService.isAuthenticated()`
3. **Si no hay token** → Muestra Login Screen
4. **Usuario ingresa credenciales** → App envía POST a `http://10.0.2.2:8080/api/auth/login`
5. **Backend valida** → Retorna JWT token
6. **App guarda token** → En Secure Storage
7. **Futuras peticiones** → Incluyen header `Authorization: Bearer {token}`

## Endpoints Usados

| Endpoint | Método | Para qué |
|----------|--------|----------|
| `/api/auth/login` | POST | Iniciar sesión |
| `/api/auth/register` | POST | Registrar usuario |
| `/api/products` | GET | Listar productos |
| `/api/cart` | GET | Ver carrito |
| `/api/cart/items` | POST | Agregar al carrito |
| `/chat/generate` | POST | Chat con IA |

## ¿El Backend debe estar corriendo?

**SÍ**, absolutamente. Antes de probar la app:

```bash
# Verificar que Docker esté corriendo
docker-compose ps

# Si no está, levantarlo
docker-compose up -d

# Verificar que el backend responda
curl http://localhost:8080/actuator/health
```

## Testing

### 1. Emulador Android
```bash
# Abrir emulador desde Android Studio
# O crear uno con:
flutter emulators --create

# Correr app
flutter run
```

### 2. Dispositivo Físico
1. Conectar teléfono vía USB
2. Habilitar "Depuración USB"
3. Modificar `api_config.dart` con la IP de tu PC:
   ```dart
   static const String baseUrl = 'http://192.168.1.105:8080/api';
   ```
4. Ejecutar: `flutter run`

## Solución de Problemas

### Error: "Connection refused"
- ✅ Verificar que Docker esté corriendo
- ✅ Verificar que el backend responda en `localhost:8080`
- ✅ Si usas dispositivo físico, usar IP de la red local

### Error: "Certificate verify failed"
- Android: Cambiar a HTTP (no HTTPS) en desarrollo
- O agregar certificado SSL al backend

### Error: "CORS blocked"
- El backend ya tiene CORS habilitado para `*`
- Si persiste, verificar `CorsConfig.java`

## Próximos Pasos

1. `flutter pub get` - Instalar dependencias
2. `flutter run` - Correr la app
3. Backend debe estar en `docker-compose up -d`
4. Probar login con usuario existente o registrar uno nuevo
