#!/bin/bash
echo "Reconstruyendo servicio AI..."
sudo docker-compose stop ai-service
sudo docker-compose rm -f ai-service
sudo docker-compose up --build -d ai-service
echo ""
echo "Esperando 5 segundos..."
sleep 5
echo ""
echo "Probando conexión..."
curl -X POST http://localhost:8000/chat/generate \
  -H "Content-Type: application/json" \
  -d '{"message": "Hola", "context": "test"}' | jq .
