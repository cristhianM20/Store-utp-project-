#!/bin/bash

echo "=== Probando conexión a Ollama ==="
echo ""

# Verificar si Ollama está corriendo
echo "1. Verificando Ollama en localhost:11435..."
curl -s http://localhost:11435/api/tags | head -20
echo ""

# Verificar IP del host desde Docker
echo "2. Obteniendo IP del host Docker..."
docker network inspect bridge | grep Gateway
echo ""

# Probar el servicio AI
echo "3. Probando servicio AI..."
curl -X POST http://localhost:8000/chat/generate \
  -H "Content-Type: application/json" \
  -d '{"message": "Hola, ¿cómo estás?", "context": "test"}' \
  2>&1 | head -50
echo ""

echo "=== Fin de pruebas ==="
