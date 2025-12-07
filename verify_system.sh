#!/bin/bash

echo "========================================="
echo "  EcommerceAI-Pro - Verificación de Sistema"
echo "========================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para verificar servicio
check_service() {
    local service=$1
    local port=$2
    local name=$3
    
    if docker-compose ps | grep -q "$service.*Up"; then
        echo -e "${GREEN}✓${NC} $name está corriendo"
        if [ ! -z "$port" ]; then
            if curl -s http://localhost:$port > /dev/null 2>&1; then
                echo -e "  ${GREEN}✓${NC} Puerto $port responde"
            else
                echo -e "  ${YELLOW}⚠${NC} Puerto $port no responde (puede estar iniciando)"
            fi
        fi
        return 0
    else
        echo -e "${RED}✗${NC} $name NO está corriendo"
        return 1
    fi
}

echo "1. Verificando Contenedores Docker..."
echo "--------------------------------------"

check_service "db" "5432" "PostgreSQL"
check_service "backend" "8080" "Backend (Spring Boot)"
check_service "frontend" "3000" "Frontend (Next.js)"
check_service "ai-service" "8000" "AI Service (FastAPI)"
check_service "ollama" "11435" "Ollama (LLM)"
check_service "n8n" "5678" "n8n (Automatización)"

echo ""
echo "2. Verificando Modelos de Ollama..."
echo "--------------------------------------"

if docker exec ollama ollama list 2>/dev/null | grep -q "qwen"; then
    echo -e "${GREEN}✓${NC} Modelo Qwen está instalado"
    docker exec ollama ollama list 2>/dev/null | grep "qwen"
else
    echo -e "${YELLOW}⚠${NC} No se encontró el modelo Qwen"
    echo "  Ejecuta: docker exec ollama ollama pull qwen2.5:7b"
fi

echo ""
echo "3. Verificando Conectividad..."
echo "--------------------------------------"

# Test Backend
if curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Backend API responde"
else
    echo -e "${YELLOW}⚠${NC} Backend API no responde"
fi

# Test AI Service
if curl -s http://localhost:8000/docs > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} AI Service responde"
else
    echo -e "${YELLOW}⚠${NC} AI Service no responde"
fi

# Test Ollama
if curl -s http://localhost:11435/api/tags > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Ollama API responde"
else
    echo -e "${YELLOW}⚠${NC} Ollama API no responde"
fi

echo ""
echo "4. Estado de n8n..."
echo "--------------------------------------"

if docker-compose ps | grep -q "n8n.*Up"; then
    echo -e "${GREEN}✓${NC} n8n está corriendo"
    echo "  Accede en: http://localhost:5678"
    echo "  Usuario: admin | Contraseña: n8n2025"
elif docker-compose ps | grep -q "n8n.*Restarting"; then
    echo -e "${RED}✗${NC} n8n tiene problemas (reiniciando constantemente)"
    echo "  Ver solución en: N8N_MANUAL.md"
    echo "  Comando rápido: sudo chown -R 1000:1000 ./n8n-data"
else
    echo -e "${YELLOW}⚠${NC} n8n no está corriendo"
fi

echo ""
echo "5. Recursos del Sistema..."
echo "--------------------------------------"

# Espacio en disco
echo "Espacio en disco:"
df -h . | tail -1 | awk '{print "  Disponible: " $4 " de " $2}'

# Uso de Docker
echo ""
echo "Uso de Docker:"
docker system df | tail -n +2

echo ""
echo "========================================="
echo "  Verificación Completa"
echo "========================================="
echo ""
echo "Para más información:"
echo "  - README.md: Guía general"
echo "  - N8N_MANUAL.md: Configuración de n8n"
echo "  - TESTING_GUIDE.md: Pruebas end-to-end"
echo "  - TROUBLESHOOTING.md: Solución de problemas"
echo ""
