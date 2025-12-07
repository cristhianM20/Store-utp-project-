from fastapi import FastAPI, HTTPException
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
        system_prompt = """Eres el asistente virtual experto de EcommerceAI, una tienda en línea de vanguardia.
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

Ejemplo de saludo: "¡Hola! Bienvenido a EcommerceAI. Soy tu asistente virtual. ¿Estás buscando algún producto en especial o necesitas ayuda con tu pedido?"
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
        
        # Save temp files to verify (DeepFace handles paths easier than in-memory bytes sometimes)
        # But let's try to pass data URI if possible, or write to temp
        
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
        result = DeepFace.verify(img1_path, img2_path, model_name="VGG-Face", enforce_detection=False)
        
        # Cleanup
        if os.path.exists(img1_path): os.remove(img1_path)
        if os.path.exists(img2_path): os.remove(img2_path)

        return {"verified": result["verified"], "distance": result["distance"]}

    except Exception as e:
        print(f"Biometric error: {str(e)}")
        return {"verified": False, "error": str(e)}

