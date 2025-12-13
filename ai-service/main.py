from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import json
import os

app = FastAPI(title="EcommerceAI AI Service", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ollama configuration
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://host.docker.internal:11434")
MODEL_NAME = "qwen2.5:7b"

async def check_and_pull_model():
    print(f"Checking if model {MODEL_NAME} exists...")
    try:
        # Check existing models
        resp = requests.get(f"{OLLAMA_URL}/api/tags")
        if resp.status_code == 200:
            models = resp.json().get("models", [])
            model_exists = any(m.get("name") == MODEL_NAME for m in models)
            if model_exists:
                print(f"Model {MODEL_NAME} found.")
                return

        print(f"Model {MODEL_NAME} not found. Pulling... (this may take a while)")
        # Pull model
        pull_resp = requests.post(
            f"{OLLAMA_URL}/api/pull", 
            json={"name": MODEL_NAME}, 
            stream=True
        )
        if pull_resp.status_code == 200:
             print("Model pull started successfully.")
             # Consume stream to ensure it finishes (blocking)
             for line in pull_resp.iter_lines():
                 if line:
                     print(f"Pulling: {line.decode('utf-8')}")
             print(f"Model {MODEL_NAME} pulled successfully.")
        else:
             print(f"Failed to pull model: {pull_resp.text}")

    except Exception as e:
        print(f"Error checking/pulling model: {e}")

@app.on_event("startup")
async def startup_event():
    # Run in background or await - verifying connectivity
    await check_and_pull_model()

class HealthCheck(BaseModel):
    status: str = "OK"

class ChatRequest(BaseModel):
    message: str
    context: str = ""

class ChatResponse(BaseModel):
    response: str

@app.get("/", tags=["Health"])
async def root():
    return {"message": "AI Service is running"}

@app.get("/health", response_model=HealthCheck, tags=["Health"])
async def health_check():
    return HealthCheck(status="OK")

# Chatbot endpoint
@app.post("/chat/generate", response_model=ChatResponse, tags=["AI"])
async def generate_chat_response(request: ChatRequest):
    try:
        # Prepare the prompt with context
        system_prompt = """Eres el asistente virtual experto de Importaciones UTP, una tienda universitaria de confianza.
Tu objetivo es brindar una experiencia de compra excepcional, personalizada y amigable.

Tus responsabilidades son:
1.  **Recomendar productos**: Basado en lo que el usuario busca, sugiere opciones relevantes de nuestro catálogo.
2.  **Responder dudas**: Aclara preguntas sobre envíos, garantías, métodos de pago y características de productos.
3.  **Asistencia técnica**: Ayuda con problemas básicos de la cuenta o navegación.

Pautas de personalidad:
-   **Tono**: Profesional pero cercano, entusiasta y servicial.
-   **Idioma**: Responde siempre en español natural y fluido.
-   **Formato**: Usa listas o negritas cuando sea útil para la lectura.
-   **Proactividad**: Si el usuario saluda, preséntate brevemente y ofrece ayuda inmediata. No digas solo "Hola".

Ejemplo de saludo: "¡Hola! Bienvenido a Importaciones UTP. Soy tu asistente virtual. ¿Estás buscando algún producto en especial o necesitas ayuda con tu pedido?"
"""
        
        full_prompt = f"{system_prompt}\n\nContexto: {request.context}\n\nUsuario: {request.message}\n\nAsistente:"
        
        # Call Ollama API
        ollama_response = requests.post(
            f"{OLLAMA_URL}/api/generate",
            json={
                "model": MODEL_NAME,
                "prompt": full_prompt,
                "stream": False
            },
            timeout=30
        )
        
        if ollama_response.status_code != 200:
            raise HTTPException(status_code=500, detail="Error communicating with Ollama")
        
        result = ollama_response.json()
        return ChatResponse(response=result.get("response", "Lo siento, no pude generar una respuesta."))
        
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Error connecting to Ollama: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

import whisper
import subprocess
import uuid

# Load Whisper model (do this at startup)
# Using "tiny" or "base" for speed on CPU, "small" is better but slower
whisper_model = whisper.load_model("base")

class VoiceResponse(BaseModel):
    text: str
    audio: str # Base64 audio

@app.post("/chat/voice", response_model=VoiceResponse, tags=["AI"])
async def voice_chat(
    file: UploadFile = File(...)
):
    try:
        # 1. Save uploaded audio to temp file
        request_id = str(uuid.uuid4())
        input_audio_path = f"temp_input_{request_id}.wav"
        
        with open(input_audio_path, "wb") as buffer:
            buffer.write(await file.read())
            
        # 2. Transcribe with Whisper
        result = whisper_model.transcribe(input_audio_path)
        transcribed_text = result["text"]
        
        print(f"Transcribed: {transcribed_text}")
        
        # 3. Generate Answer with Ollama
        chat_request = ChatRequest(message=transcribed_text)
        chat_response = await generate_chat_response(chat_request)
        response_text = chat_response.response
        
        print(f"Response: {response_text}")
        
        # 4. Synthesize with Piper TTS
        output_audio_path = f"temp_output_{request_id}.wav"
        
        # Clean text for TTS (remove markdown stars etc)
        clean_text = response_text.replace("*", "").replace("#", "")
        
        # Run Piper
        # echo 'text' | piper --model /app/models/es_ES-sharvard-medium.onnx --output_file output.wav
        cmd = f"echo '{clean_text}' | /usr/local/bin/piper --model /app/models/es_ES-sharvard-medium.onnx --output_file {output_audio_path}"
        subprocess.run(cmd, shell=True, check=True)
        
        # 5. Read output audio and convert to base64
        with open(output_audio_path, "rb") as audio_file:
            audio_content = audio_file.read()
            audio_base64 = base64.b64encode(audio_content).decode("utf-8")
            
        # Cleanup
        if os.path.exists(input_audio_path): os.remove(input_audio_path)
        if os.path.exists(output_audio_path): os.remove(output_audio_path)
            
        return VoiceResponse(text=response_text, audio=audio_base64)

    except Exception as e:
        print(f"Voice chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Placeholder for Biometrics
from deepface import DeepFace
import base64
import cv2
import numpy as np

class BiometricRequest(BaseModel):
    captured_image: str  # Base64 encoded image
    stored_image: str    # Base64 encoded image or path

@app.post("/biometrics/verify", tags=["Biometrics"])
async def verify_biometrics(request: BiometricRequest):
    try:
        # Decode base64 images
        # For simplicity, we assume stored_image is also sent as base64 or a valid path that DeepFace can read
        # In a real scenario, we might handle embeddings directly
        
        # Helper to save base64 to temp file
        def save_b64_to_temp(b64_str, filename):
            if "," in b64_str:
                b64_str = b64_str.split(",")[1]
            img_data = base64.b64decode(b64_str)
            with open(filename, "wb") as f:
                f.write(img_data)
            return filename

        img1_path = save_b64_to_temp(request.captured_image, "temp_captured.jpg")
        img2_path = save_b64_to_temp(request.stored_image, "temp_stored.jpg")

        # Verify
        # Using Facenet512 for better accuracy (state-of-the-art accuracy ~99.65%)
        # enforce_detection=True ensures a face is actually present
        result = DeepFace.verify(
            img1_path, 
            img2_path, 
            model_name="Facenet512", 
            detector_backend="opencv",
            distance_metric="cosine",
            enforce_detection=True
        )
        
        # Cleanup
        if os.path.exists(img1_path): os.remove(img1_path)
        if os.path.exists(img2_path): os.remove(img2_path)

        return {"verified": result["verified"], "distance": result["distance"]}

    except Exception as e:
        print(f"Biometric error: {str(e)}")
        return {"verified": False, "error": str(e)}

