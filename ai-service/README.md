# EcommerceAI-Pro AI Service 🧠

Servicio de Inteligencia Artificial basado en Python FastAPI. Maneja todas las operaciones de ML/IA del sistema.

## 🚀 Capacidades

1. **RAG Chatbot (Ollama)**:
   - Modelos: `qwen2.5:7b` (descarga automática).
   - Función: Generación de respuestas coherentes y contextuales para ventas.

2. **Reconocimiento de Voz (Whisper)**:
   - Librería: `openai-whisper`.
   - Modelo: `base` (in-memory).
   - Función: Transcripción de audio a texto (STT).

3. **Síntesis de Voz (Piper)**:
   - Motor: Piper TTS.
   - Modelo: `es_ES-sharvard-medium.onnx` (Voz en español).
   - Función: Conversión de texto a audio (TTS).

4. **Biometría Facial (DeepFace)**:
   - Librería: DeepFace (TensorFlow/Keras).
   - Modelos: `Facenet512` (verificación), `yolov8` (detección).
   - Función: Autenticación segura por rostro.

## 🛠️ Desarrollo Local

```bash
# 1. Crear entorno virtual
python -m venv venv
source venv/bin/activate

# 2. Instalar dependencias (sistema)
sudo apt-get install ffmpeg espeak-ng

# 3. Instalar dependencias (python)
pip install -r requirements.txt

# 4. Ejecutar
uvicorn main:app --reload --port 8000
```
