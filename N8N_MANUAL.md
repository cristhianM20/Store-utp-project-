# Manual de Configuración de n8n para EcommerceAI-Pro

## Problema de Permisos

El contenedor de n8n tiene un problema de permisos con el volumen montado. Aquí está la solución paso a paso:

## Solución Rápida

### Opción 1: Cambiar permisos del directorio (Recomendado)

```bash
# Detener n8n
docker-compose stop n8n

# Cambiar el propietario del directorio a UID 1000 (usuario node en el contenedor)
sudo chown -R 1000:1000 ./n8n-data

# Reiniciar n8n
docker-compose up -d n8n
```

### Opción 2: Modificar docker-compose.yml

Agrega la siguiente línea en la sección de n8n en `docker-compose.yml`:

```yaml
n8n:
  image: n8nio/n8n
  restart: always
  user: "${UID}:${GID}"  # <-- Agregar esta línea
  ports:
    - "5678:5678"
  environment:
    - N8N_HOST=localhost
    - N8N_PROTOCOL=http
    - N8N_BASIC_AUTH_ACTIVE=true
    - N8N_BASIC_AUTH_USER=admin
    - N8N_BASIC_AUTH_PASSWORD=n8n2025
  volumes:
    - ./n8n-data:/home/node/.n8n
```

Luego ejecuta:
```bash
export UID=$(id -u)
export GID=$(id -g)
docker-compose up -d n8n
```

## Acceso a n8n

Una vez solucionado el problema de permisos:

1. Abre tu navegador en: `http://localhost:5678`
2. Credenciales:
   - Usuario: `admin`
   - Contraseña: `n8n2025`

## Configuración de Workflows

### Workflow 1: Add to Cart Tracker

Este workflow rastrea cuando los usuarios agregan productos al carrito.

**Pasos para crear el workflow:**

1. **Crear Nuevo Workflow**
   - Haz clic en el botón "+" en la esquina superior derecha
   - Nombre: "Add to Cart Tracker"

2. **Agregar Nodo Webhook**
   - Arrastra el nodo "Webhook" al canvas
   - Configura:
     - **Method**: POST
     - **Path**: `add-to-cart`
     - **Response Mode**: "Respond Immediately"

3. **Agregar Nodo IF (Condicional)**
   - Conecta webhook → IF
   - Configura:
     - **Condition**: Number
     - **Value 1**: `{{ $json.quantity }}`
     - **Operation**: "Larger Than"
     - **Value 2**: `3`

4. **Agregar Nodo Code (Para Logging)**
   - Conecta desde ambas ramas (true/false)
   - Código:
   ```javascript
   console.log('User added to cart:', $input.all()[0].json);
   return $input.all();
   ```

5. **Activar Workflow**
   - Toggle en la esquina superior derecha: "Inactive" → "Active"

### Workflow 2: Checkout Reminder (Carrito Abandonado)

Este workflow envía recordatorios para carritos abandonados.

**Pasos para crear el workflow:**

1. **Crear Nuevo Workflow**
   - Nombre: "Checkout Reminder"

2. **Agregar Nodo Schedule**
   - Nodo: "Schedule Trigger"
   - Configura:
     - **Trigger Interval**: "Every Day"
     - **Time**: "10:00"

3. **Agregar Nodo HTTP Request (Get Abandoned Carts)**
   - Configura:
     - **Method**: GET
     - **URL**: `http://backend:8080/api/cart/abandoned?hours=24`
     - **Authentication**: Bearer Token (usar JWT)

4. **Agregar Nodo Function (Generar Mensaje)**
   - Código:
   ```javascript
   const cart = $json;
   return {
     email: cart.userEmail,
     subject: "¡No olvides tu carrito!",
     message: `Hola, tienes ${cart.itemCount} productos esperándote.`
   };
   ```

5. **Activar Workflow**

## Verificación

### Probar Add to Cart Webhook

```bash
curl -X POST http://localhost:5678/webhook/add-to-cart \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "userEmail": "test@example.com",
    "productId": 1,
    "productName": "Test Product",
    "quantity": 5,
    "timestamp": "2024-01-01T10:00:00"
  }'
```

Deberías ver el workflow ejecutarse en n8n > "Executions".

## Recursos

- [Documentación n8n](https://docs.n8n.io/)
- [Nodos disponibles](https://docs.n8n.io/integrations/builtin/core-nodes/)
- [Expresiones](https://docs.n8n.io/code-examples/expressions/)

## Notas Importantes

- Los workflows en n8n se crean visualmente, no programáticamente
- Cada webhook tiene una URL única generada por n8n
- Los datos se pasan entre nodos usando `$json`
- Usa el modo "Test" para depurar workflows
- El backend ya está configurado para enviar webhooks a n8n cuando se agregan productos al carrito
