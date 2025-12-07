#!/bin/bash

echo "=== Verificación del Sistema Biométrico ==="
echo ""

# 1. Verificar que los servicios estén corriendo
echo "1. Estado de servicios:"
docker-compose ps

echo ""
echo "2. Verificando endpoint de biometría en AI Service..."
curl -s http://localhost:8000/health | jq .

echo ""
echo "3. Verificando usuarios en la base de datos..."
docker exec -i $(docker-compose ps -q db) psql -U dev -d ecomai -c "SELECT email, CASE WHEN biometric_data IS NOT NULL AND length(biometric_data) > 100 THEN 'REGISTRADO ✓' ELSE 'NO REGISTRADO ✗' END as face_id FROM users;"

echo ""
echo "=== Instrucciones para probar Face ID ==="
echo "1. Abre http://localhost:3000/login"
echo "2. Inicia sesión con tu usuario"
echo "3. Ve al Dashboard (http://localhost:3000/dashboard)"
echo "4. Haz clic en 'Activar Face ID'"
echo "5. Permite el acceso a la cámara"
echo "6. Captura tu rostro"
echo "7. Cierra sesión"
echo "8. En Login, ingresa tu email y haz clic en 'Inicio de Sesión con Face ID'"
echo ""
