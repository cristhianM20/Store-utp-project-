# Solución a Errores de Red en Docker Build

## Problema

Al ejecutar `docker compose build --no-cache`, aparecen errores de red:
- **Frontend**: `npm ci` - `ECONNRESET` 
- **Backend**: Maven no puede descargar de `repo.maven.apache.org`
- **AI Service**: `pip install` - timeout

## Causa

Estos son **problemas temporales de conectividad de red**. El flag `--no-cache` elimina todas las capas cacheadas y fuerza a descargar TODAS las dependencias de nuevo desde internet.

## ✅ Solución Recomendada

### 1. NO uses `--no-cache` 

```bash
# ❌ EVITA ESTO cuando hay problemas de red
docker compose build --no-cache

# ✅ USA ESTO en su lugar
docker compose up -d
```

### 2. Si necesitas rebuild por cambios de código

```bash
# Para rebuild sin eliminar caché
docker compose build

# O rebuild y levantar
docker compose up --build -d

# Solo rebuild un servicio específico
docker compose build frontend
docker compose up -d frontend
```

### 3. Si los servicios ya están corriendo

```bash
# Solo verifica el estado
docker-compose ps

# Si todo está "Up", no necesitas rebuild
# Solo reinicia el servicio que modificaste
docker-compose restart backend
```

## Cuándo SÍ usar `--no-cache`

Solo cuando:
- ✅ Tienes conexión a internet **estable y rápida**
- ✅ Cambiaste versiones en `package.json`, `pom.xml` o `requirements.txt`
- ✅ Sospechas de dependencias corruptas en caché
- ✅ Quieres asegurar un build limpio para producción

## Errores Comunes y Soluciones

### Error: `npm ci` - ECONNRESET
```bash
# Solución: Usa el caché existente
docker-compose up -d frontend
```

### Error: Maven - "Unknown host repo.maven.apache.org"
```bash
# Solución: Espera unos minutos y usa caché
docker-compose up -d backend
```

### Error: `pip install` - timeout
```bash
# Solución: Usa el caché existente
docker-compose up -d ai-service
```

## Verificar que Todo Está Corriendo

```bash
# Ver servicios activos
docker-compose ps

# Ver logs de un servicio
docker-compose logs -f backend

# Probar endpoints
curl http://localhost:8080/actuator/health  # Backend
curl http://localhost:3000                  # Frontend  
curl http://localhost:8000/health           # AI Service
```

## Comandos Útiles

```bash
# Reiniciar solo lo que modificaste
docker-compose restart backend

# Ver logs en tiempo real
docker-compose logs -f

# Detener todo
docker-compose down

# Levantar todo (usa caché)
docker-compose up -d

# Rebuild específico sin --no-cache
docker-compose build backend
docker-compose up -d backend
```

## Resumen

> 💡 **Regla de Oro**: Si tus servicios ya están corriendo (`docker-compose ps` muestra todo "Up"), NO necesitas hacer rebuild a menos que hayas cambiado archivos de configuración de dependencias.

## Problemas de Chat de Voz

### 1. El Bot responde "Error al conectar con el asistente"
- **Causa**: El modelo de IA (`qwen2.5:7b`) no está descargado en Ollama.
- **Solución**:
  - Revisa los logs: `docker compose logs -f ai-service`
  - Espera a que termine la descarga automática (puede tardar 5-10 min).
  - O descarga manual: `docker exec ollama ollama pull qwen2.5:7b`

### 2. Error de compilación en Flutter: "RecordLinux" / "conflict"
- **Causa**: Conflicto de versiones con el paquete `record` en Linux.
- **Solución**:
  - Cambiamos a `flutter_sound`.
  - Ejecuta: `flutter clean && flutter pub get`

### 3. Error 403 Forbidden al construir ai-service
- **Causa**: Repositorios de Debian bloqueados por red/ISP.
- **Solución**:
  - Cambia la imagen base en `Dockerfile` a `python:3.11-slim-bookworm` (estable) o usa un mirror.
