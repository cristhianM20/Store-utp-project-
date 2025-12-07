#!/bin/bash

# Script simple para verificar conectividad con n8n

echo "Verificando conectividad con n8n..."

# Intentar conectar al endpoint de webhook (esperamos 404 si no hay workflow, o 200 si hay)
# Pero al menos confirmamos que el puerto responde
HTTP_CODE=$(curl -o /dev/null -s -w "%{http_code}\n" http://localhost:5678/webhook/add-to-cart)

if [ "$HTTP_CODE" == "000" ]; then
    echo "❌ Error: No se puede conectar a n8n en http://localhost:5678"
    echo "Asegúrate de que el contenedor de n8n esté corriendo: docker-compose ps"
else
    echo "✅ Conexión exitosa con n8n (Código HTTP: $HTTP_CODE)"
    if [ "$HTTP_CODE" == "404" ]; then
        echo "⚠️  Nota: Recibiste un 404. Esto es normal si no has activado el workflow en n8n todavía."
        echo "   Sigue la guía N8N_SETUP_GUIDE.md para configurar el workflow."
    elif [ "$HTTP_CODE" == "200" ]; then
        echo "🎉 ¡El webhook está activo y respondiendo!"
    fi
fi
