# EcommerceAI-Pro Mobile App 📱

Aplicación móvil oficial de **EcommerceAI-Pro**, construida con Flutter.

## 🌟 Características

- **Autenticación Biométrica**: Inicio de sesión seguro con Huella Digital o Face ID.
- **Chat de Voz con IA**: Asistente de ventas inteligente con reconocimiento de voz (Whisper) y respuesta hablada (Piper).
- **Catálogo en Tiempo Real**: Sincronización con Backend Spring Boot.
- **Gestión de Carrito**: Experiencia de compra fluida.

## ⚙️ Configuración Rápida

### 1. Requisitos
- Flutter SDK 3.x
- Dispositivo Android (o Emulador)
- Backend corriendo (ver README principal)

### 2. Configuración de Red (¡Importante!)
Si usas un dispositivo físico, debes configurar la IP de tu servidor backend.

1. Abre `lib/config/api_config.dart`
2. Modifica la variable `_defaultHost`:
   ```dart
   // Para Emulador (por defecto)
   static const String _defaultHost = 'http://10.0.2.2:8080';
   
   // Para Dispositivo Físico (Tu IP local)
   // static const String _defaultHost = 'http://192.168.1.15:8080';
   ```

### 3. Ejecutar
```bash
flutter pub get
flutter run
```

Para documentación completa del sistema, ver el [README Principal](../README.md).
