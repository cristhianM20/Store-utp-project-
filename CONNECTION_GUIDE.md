# Guía de Conexión: Solución de Problemas Móvil-Backend 🌐

Una de las dificultades más comunes en desarrollo móvil es conectar la App (en emulador o dispositivo físico) con el Backend local. Esta guía cubre todos los escenarios.

## 1. Escenario: Emulador Android (AVD) 🤖

El emulador de Android vive en una red virtual separada. Para él, `localhost` es **su propio sistema**, no tu computadora.

- **Dirección Especial**: `10.0.2.2`
- **Puerto Backend**: `8080`
- **URL Correcta en Flutter**: `http://10.0.2.2:8080`

### Configuración en `api_config.dart`
El código ya viene pre-configurado para esto:
```dart
static const String _defaultHost = 'http://10.0.2.2:8080';
```

## 2. Escenario: Dispositivo Físico (USB/WiFi) 📱

Tu celular está en la red WiFi de tu casa/oficina. No puede entender `10.0.2.2` ni `localhost`. Necesita la **IP Local (LAN)** de tu computadora.

### Paso 1: Obtener tu IP
En tu terminal de PC:
- **Linux/Mac**: `ip addr` o `ifconfig` (busca `inet` en `wlan0` o `eth0`, ej: `192.168.1.15`)
- **Windows**: `ipconfig` (busca dirección IPv4)

### Paso 2: Editar Configuración
Abre `lib/config/api_config.dart` y cambia:
```dart
// Reemplaza X por tu IP real
static const String _defaultHost = 'http://192.168.1.15:8080';
```

### Paso 3: Firewall (Importante en Linux/Windows) 🛡️
Si tu PC tiene firewall activado, bloqueará la conexión entrante del celular.

**Solución Rápida (Linux - Fedora/Firewalld):**
```bash
# Permitir puerto 8080 temporalmente
sudo firewall-cmd --add-port=8080/tcp
# O agregar a la zona de confianza si estás en casa
```

**Prueba de Conexión:**
Abre el navegador Chrome en tu celular e intenta entrar a `http://192.168.1.15:8080/actuator/health` (o cualquier endpoint). Si no carga, es problema de red/firewall.

## 3. Cleartext Traffic (HTTP vs HTTPS) 🔓

Android 9+ bloquea por defecto todas las conexiones que no sean HTTPS (Internet Seguro). Como en desarrollo local usamos HTTP plano:

### Configuración Realizada
Hemos agregado esto en `android/app/src/main/AndroidManifest.xml`:

```xml
<application
    ...
    android:usesCleartextTraffic="true"> <!-- ✅ Permite HTTP -->
```

Si eliminaste esta línea, la app fallará con errores como `SocketException: ERR_CLEARTEXT_NOT_PERMITTED`.

## 4. Checklist de Solución de Problemas ✅

Si recibes `Connection refused` o `Network is unreachable`:

1. [ ] ¿Están PC y Celular en el mismo WiFi? (Algunas redes "Guest" aíslan dispositivos).
2. [ ] ¿La IP en `api_config.dart` es correcta? (Esta cambia si reinicias el router).
3. [ ] ¿El Backend está corriendo? (`docker ps`).
4. [ ] ¿El Firewall permite el puerto 8080?
5. [ ] ¿Has reiniciado la App completamente (Stop -> Run) después de cambiar la IP?
