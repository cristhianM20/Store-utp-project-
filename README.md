EcommerceAI-Pro

Plataforma de comercio electronico con backend en Go, frontend en Next.js, servicio de IA en Python y app movil en Flutter.

Arquitectura

- Backend: Go (Golang) - API REST con JWT
- Frontend: Next.js + TypeScript - Interfaz web estilo clasico
- AI Service: Python FastAPI - Chatbot, voz y biometria facial
- Database: PostgreSQL 16
- LLM Engine: Ollama (modelo Qwen 2.5 7B)
- Mobile: Flutter - App con autenticacion biometrica

Estructura

- go-backend/     - Servidor API en Go
- frontend/       - Aplicacion web Next.js
- ai-service/     - Microservicio de IA en Python
- flutter_app/    - Aplicacion movil
- docker-compose.yml - Orquestacion de contenedores

Instalacion rapida

1. Clonar el repositorio
2. Ejecutar: docker-compose up -d
3. Acceder:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - AI Service: http://localhost:8000

Credenciales de prueba

- Email: admin@utp.edu.co
- Password: admin123

Caracteristicas principales

- Autenticacion JWT segura
- Catalogo de productos con CRUD
- Chatbot impulsado por IA local (Ollama)
- Chat de voz (STT con Whisper, TTS con Piper)
- Verificacion biometrica facial (DeepFace)
- App movil con Face ID/Touch ID

Requisitos

- Docker y Docker Compose
- Go 1.19+ (para desarrollo local del backend)
- Node.js 18+ (para desarrollo del frontend)
- Python 3.9+ (para el servicio de IA)
- Flutter 3.x (para la app movil)

Licencia

MIT
