#!/bin/bash

echo "=== Iniciando reparación y configuración de Ollama ==="

# 1. Levantar contenedores (asegurando que se tomen los cambios de docker-compose.yml)
echo "1. Levantando contenedores..."
sudo docker-compose up -d --remove-orphans

# 2. Esperar a que Ollama esté listo
echo "2. Esperando a que Ollama inicie..."
sleep 5

# 3. Descargar el modelo (esto puede tardar unos minutos)
echo "3. Descargando modelo qwen2.5:7b en el contenedor..."
sudo docker exec ollama ollama pull qwen2.5:7b

# 4. Probar la conexión
echo "4. Ejecutando pruebas de conexión..."
./test_ollama.sh

echo "=== Proceso completado ==="
