# Documentación Técnica EcommerceAI-Pro 🛠️

Este documento profundiza en los detalles arquitectónicos, decisiones de diseño y configuraciones avanzadas del sistema.

## 1. Módulo de Chat de Voz (Nuevo) 🎤

### Arquitectura de Flujo de Audio
El sistema de chat de voz implementa un pipeline de 5 etapas para lograr una interacción natural:

1. **Captura (App Flutter)**:
   - Librería: `flutter_sound` version 9.x.
   - Formato: AAC (Advanced Audio Coding) encapsulado en MP4/M4A. Esto garantiza alta compresión y calidad compatible con Android/iOS.
   - Sample Rate: 44.1kHz (estándar).

2. **Transmisión (App -> Backend -> AI Service)**:
   - Protocolo: HTTP Multipart Form Data (`multipart/form-data`).
   - Endpoint: `POST /chat/voice`.
   - El Backend Spring Boot actúa como un **Proxy Transparente** (`ChatController.java`), reenviando el archivo binario sin procesarlo al servicio de Python.

3. **Reconocimiento de Voz (STT - AI Service)**:
   - Motor: **OpenAI Whisper** (modelo `base`).
   - Ubicación: Ejecución local en CPU dentro del contenedor `ai-service`.
   - Proceso: Convierte el audio temporal (`temp_input.wav`) a texto plano.

4. **Inteligencia (LLM - Ollama)**:
   - Motor: **Qwen 2.5 (7B)** ejecutado en Ollama.
   - Contexto: Se inyecta un System Prompt que define la personalidad de "Asistente de Ventas".
   - Comunicación: El servicio de Python llama a la API de Ollama (`http://ollama:11434/api/generate`).

5. **Síntesis de Voz (TTS - AI Service)**:
   - Motor: **Piper TTS**.
   - Modelo: `es_ES-sharvard-medium.onnx` (Voz en español natural y rápida).
   - Proceso: Genera un archivo WAV a partir del texto de respuesta.
   - Salida: Se codifica el audio WAV en **Base64** y se devuelve en el JSON de respuesta.

### Decisiones de Diseño

- **¿Por qué Whisper Local?**: Evita costos de API (como Google STT o OpenAI API) y mantiene la privacidad de los datos de voz. El modelo `base` ofrece un buen equilibrio velocidad/precisión para CPU.
- **¿Por qué Piper TTS?**: Es extremadamente rápido en CPU (funciona incluso en Raspberry Pi) y tiene voces neuronales de alta calidad, muy superiores a `espeak` o `gTTS`.
- **Proxy en Backend**: Centraliza la autenticación (JWT) en Spring Boot. La App móvil nunca habla directamente con el servicio de IA, reduciendo la superficie de ataque.

## 2. Autenticación Biométrica (Huella/Face ID) 🔒

### Flujo de Seguridad

1. **Vinculación**:
   - El usuario inicia sesión tradicional (User/Pass).
   - Se generan **tokens de larga duración** (Refresh Tokens) o se encriptan las credenciales.
   - Se almacenan en `FlutterSecureStorage` (Keystore en Android, Keychain en iOS).

2. **Desbloqueo**:
   - `local_auth` solicita verificación biométrica al SO.
   - Si el SO confirma la identidad (True), la App desencripta las credenciales almacenadas.
   - Se realiza un login silencioso al Backend para obtener un nuevo Access Token.

### Consideraciones de Privacidad
- **NUNCA** se envían huellas o datos faciales al servidor.
- La validación es 100% local en el dispositivo del usuario.
- El servidor solo recibe una petición de login estándar.

## 3. Microservicios e Infraestructura 🐳

### AI Service (Python FastAPI)
- **Imagen Base**: `python:3.11-slim-bookworm` (Debian 12).
- **Justificación**: Se eligió Bookworm sobre Alpine porque las librerías de IA (Torch, Numpy, Pandas) suelen tener problemas de compilación en musl libc (Alpine). Debian tiene mejor compatibilidad con ruedas pre-compiladas (bi-nary wheels).
- **Auto-Recuperación**: El script de inicio (`startup_event`) verifica la existencia del modelo LLM en Ollama. Si no existe, lanza una descarga asíncrona, previniendo fallos en tiempo de ejecución.

### Base de Datos (PostgreSQL)
- **Persistencia**: Volumen `postgres_data`.
- **Esquema**: Relacional estándar.
- **Conectividad**: Solo accesible desde la red interna de Docker (`backend`), puerto `5432` expuesto solo para depuración local.

## 4. Automatización (n8n) ⚙️
- **Rol**: Orquestador de eventos de negocio asíncronos.
- **Trigger**: Webhooks disparados por el Backend (ej. `InventoryLowEvent`, `CartAbandonedEvent`).
- **Acciones**: Envío de correos, notificaciones Slack, actualizaciones de CRM.
- **Seguridad**: Ejecuta en red interna, pero expone puerto `5678` para configuración visual.
