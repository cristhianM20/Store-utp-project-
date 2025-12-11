# Ecommerce-Pro 🚀

EcommerceAI-Pro es una plataforma de comercio electrónico de última generación impulsada por Inteligencia Artificial. Combina una arquitectura moderna de microservicios con características avanzadas como autenticación biométrica, asistentes de compras con IA y automatización de flujos de trabajo.

## 🌟 Características Principales

- **Full Stack Moderno**: Backend Spring Boot + Frontend Next.js + App Móvil Flutter
- **Inteligencia Artificial**:
  - **Chatbot Asistente**: Responde preguntas sobre productos y ayuda en la compra (Qwen 2.5 vía Ollama)
  - **Chat de Voz**: Interacción por voz bidireccional (Whisper para STT + Piper para TTS)
  - **Biometría Facial**: Login y registro seguro usando reconocimiento facial (DeepFace)
- **Automatización**: Integración con n8n para flujos de trabajo inteligentes (ej. recuperación de carritos)
- **Experiencia de Usuario Premium**: Diseño UI/UX de alta calidad con animaciones y transiciones fluidas

## 🏗️ Arquitectura

El proyecto consta de los siguientes servicios contenerizados con Docker:

- **Frontend**: Next.js (Puerto 3000)
- **Backend**: Spring Boot (Puerto 8080)
- **AI Service**: Python FastAPI (Puerto 8000)
- **Database**: PostgreSQL (Puerto 5432)
- **Automation**: n8n (Puerto 5678)
- **LLM Engine**: Ollama (Puerto 11435)

## 🚀 Inicio Rápido

### Prerrequisitos
- Docker y Docker Compose
- Flutter SDK (para la app móvil)
- Node.js 18+ (opcional, para desarrollo local frontend)
- Java 17+ (opcional, para desarrollo local backend)

### 1. Levantar Servicios (Docker)

```bash
# Clonar el repositorio
cd EcommerceAI-Pro

# Levantar todos los servicios
docker-compose up -d --build
```

Esto iniciará todos los servicios. La primera vez puede tardar unos minutos en descargar las imágenes y modelos de IA.

### 2. Configurar Modelos de IA
 
El servicio de IA intentará descargar automáticamente el modelo `qwen2.5:7b` al iniciarse. Sin embargo, puedes hacerlo manualmente para asegurar que esté listo:

```bash
# Descargar el modelo Qwen 2.5 (recomendado)
docker exec ollama ollama pull qwen2.5:7b

# O si prefieres un modelo más ligero:
docker exec ollama ollama pull qwen2.5:3b

# Verificar que el modelo se descargó
docker exec ollama ollama list
```

### 3. Verificar que los Servicios Están Corriendo

```bash
# Ver el estado de todos los contenedores
docker-compose ps

# Deberías ver todos los servicios "Up" excepto n8n (ver manual de n8n)
```

### 4. Acceder a las Aplicaciones

- **Frontend Web**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **AI Service**: http://localhost:8000
- **n8n (Automatización)**: http://localhost:5678 (ver `N8N_MANUAL.md` para configuración)

### 5. Ejecutar App Móvil

```bash
cd flutter_app
flutter pub get
flutter run
```

**Nota**: Para dispositivos físicos, actualiza la IP en `flutter_app/lib/config/api_config.dart` con la IP de tu máquina (no uses `localhost`).

## 🧪 Testing y Validación

Para realizar una prueba completa del sistema (End-to-End), consulta la guía:
👉 `TESTING_GUIDE.md`

## 📚 Documentación Adicional

- **`CONTRIBUTING.md`**: **Guía completa para desarrolladores** (arquitectura, modificaciones, convenciones)
- **`TECHNICAL_DOCUMENTATION.md`**: Detalles técnicos profundos de la arquitectura
- **`N8N_MANUAL.md`**: Manual completo para configurar n8n (incluye solución de permisos)
- **`TESTING_GUIDE.md`**: Guía de testing end-to-end
- **`TROUBLESHOOTING.md`**: Solución de problemas comunes
- **`FLUTTER_SETUP.md`**: Guía de instalación de Flutter
- **`CONNECTION_GUIDE.md`**: Guía de conexión Flutter-Backend

## 🔧 Solución de Problemas Comunes

### AI Service no inicia

Si el servicio AI no inicia correctamente:

```bash
# Ver los logs
docker logs ecommerceai-pro-ai-service-1

# Reconstruir el servicio
docker-compose stop ai-service
docker-compose rm -f ai-service
docker-compose build ai-service
docker-compose up -d ai-service
```

### n8n tiene problemas de permisos

Ver el manual completo en `N8N_MANUAL.md`. Solución rápida:

```bash
docker-compose stop n8n
sudo chown -R 1000:1000 ./n8n-data
docker-compose up -d n8n
```

### Ollama no responde

```bash
# Verificar que Ollama está corriendo
docker logs ollama

# Verificar que el modelo está descargado
docker exec ollama ollama list

# Probar el modelo
docker exec ollama ollama run qwen2.5:7b "Hola, ¿cómo estás?"
```

### Frontend no se conecta al Backend

Verifica las variables de entorno en `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_AI_URL=http://localhost:8000
```

### Admin Dashboard

Para gestionar productos (crear, editar, eliminar), accede a:
- **URL**: http://localhost:3000/admin
- **Características**:
  - Carga de imágenes local (se guardan en `backend/uploads`)
  - Validación de formularios
  - Logs de sistema en tiempo real
- **Nota**: Actualmente está abierto para demostración. En producción, debería restringirse a usuarios con rol ADMIN.

## 🛠️ Desarrollo

### Estructura del Proyecto

```
EcommerceAI-Pro/
├── backend/              # Spring Boot API
├── frontend/             # Next.js Web App
├── flutter_app/          # Flutter Mobile App
├── ai-service/           # Python FastAPI AI Service
├── n8n-data/            # n8n workflows y configuración
├── docker-compose.yml   # Orquestación de servicios
└── README.md           # Este archivo
```

### Comandos Útiles

```bash
# Ver logs de un servicio específico
docker-compose logs -f [service-name]

# Reconstruir un servicio específico
docker-compose build [service-name]

# Reiniciar todos los servicios
docker-compose restart

# Detener todos los servicios
docker-compose down

# Limpiar todo (incluyendo volúmenes)
docker-compose down -v
```

## 🔐 Credenciales por Defecto

- **n8n**:
  - Usuario: `admin`
  - Contraseña: `n8n2025`

- **PostgreSQL**:
  - Usuario: `postgres`
  - Contraseña: `postgres`
  - Base de datos: `ecommerce`

## 📝 Notas Importantes

- El servicio AI requiere bastante RAM (mínimo 4GB recomendado)
- Ollama descargará modelos grandes (varios GB), asegúrate de tener espacio en disco
- La primera compilación del backend puede tardar varios minutos
- Para producción, cambia todas las credenciales por defecto



## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.
