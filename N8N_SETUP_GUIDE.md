# Configuración de n8n Workflows

Este documento te guía paso a paso para configurar los workflows de n8n para automatizar eventos del e-commerce.

## Acceso a n8n

1. Abre tu navegador en: `http://localhost:5678`
2. Credenciales:
   - Usuario: `admin`
   - Contraseña: `n8n2025`

---

## Workflow 1: Add to Cart Tracker

Este workflow rastrea cuando los usuarios agregan productos al carrito y puede enviar sugerencias.

### Pasos:

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

4. **Agregar Nodo HTTP Request (True Branch)**
   - Si la cantidad > 3, enviar notificación
   - Configura:
     - **Method**: POST
     - **URL**: `http://backend:8080/api/notifications/send` (placeholder)
     - **Body**: JSON con mensaje de sugerencia

5. **Agregar Nodo Code (Para Logging)**
   - Conecta desde ambas ramas (true/false)
   - Código:
   ```javascript
   console.log('User added to cart:', $input.all()[0].json);
   return $input.all();
   ```

6. **Activar Workflow**
   - Toggle en la esquina superior derecha: "Inactive" → "Active"

---

## Workflow 2: Checkout Reminder (Carrito Abandonado)

Este workflow envía recordatorios para carritos abandonados.

### Pasos:

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

4. **Agregar Nodo Split In Batches**
   - Para procesar cada carrito individualmente

5. **Agregar Nodo Function (Generar Mensaje)**
   - Código:
   ```javascript
   const cart = $json;
   return {
     email: cart.userEmail,
     subject: "¡No olvides tu carrito!",
     message: `Hola, tienes ${cart.itemCount} productos esperándote.`
   };
   ```

6. **Agregar Nodo Send Email** (Opcional)
   - Si tienes configurado SMTP
   - O usar HTTP Request para servicio de email

7. **Activar Workflow**

---

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

---

## Recursos

- [Documentación n8n](https://docs.n8n.io/)
- [Nodos disponibles](https://docs.n8n.io/integrations/builtin/core-nodes/)
- [Expresiones](https://docs.n8n.io/code-examples/expressions/)

---

## Notas

- Los workflows en n8n se crean visualmente, no programáticamente
- Cada webhook tiene una URL única generada por n8n
- Los datos se pasan entre nodos usando `$json`
- Usa el modo "Test" para depurar workflows
