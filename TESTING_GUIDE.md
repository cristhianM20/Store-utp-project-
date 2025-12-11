# Guía de Testing End-to-End (E2E) 🧪

Esta guía describe el escenario de prueba completo para validar la integración de todos los componentes de EcommerceAI-Pro: Web, Móvil, Backend, IA y Automatización.

## Escenario de Prueba: "El Flujo del Comprador Moderno"

### 1. Registro Web 🖥️
**Objetivo**: Verificar creación de usuario y base de datos.
1. Abre `http://localhost:3000/register`.
2. Crea un usuario:
   - Nombre: `Test User`
   - Email: `test@demo.com`
   - Password: `password123`
3. **Validación**: Deberías ser redirigido al Dashboard.

### 2. Configuración Biométrica (Móvil) 📱
**Objetivo**: Verificar conexión móvil-backend y servicio de IA (DeepFace).
1. Abre la app móvil en tu dispositivo/emulador.
2. Inicia sesión con las credenciales creadas en el paso 1.
3. Ve al Menú Lateral (Drawer) -> **Configurar Face ID**.
4. Toma una selfie y guárdala.
5. **Validación**: Mensaje "Face ID configurado exitosamente".

### 3. Login Biométrico (Web) 🖥️
**Objetivo**: Verificar autenticación cruzada y reconocimiento facial.
1. Cierra sesión en la Web (`http://localhost:3000`).
2. Ve a `http://localhost:3000/login`.
3. Haz clic en el icono de **Face ID** (cámara).
4. Permite acceso a la cámara y deja que te escanee.
5. **Validación**: Deberías iniciar sesión automáticamente sin escribir contraseña.

### 4. Compra y Carrito (Móvil) 📱
**Objetivo**: Verificar sincronización de carrito y webhooks.
1. En la app móvil, navega por el catálogo.
2. Agrega al menos **4 unidades** de cualquier producto al carrito (para disparar la regla de >3 items en n8n).
3. Ve a la pantalla de Carrito y verifica el total.

### 5. Verificación de Automatización (n8n) ⚙️
**Objetivo**: Verificar que el backend disparó el webhook y n8n lo procesó.
1. Ve a `http://localhost:5678` (n8n UI).
2. Abre el workflow "Add to Cart Tracker".
3. Revisa la pestaña **Executions**.
4. **Validación**: Deberías ver una ejecución exitosa (verde) con los datos del producto agregado.

### 6. Asistente IA (Web/Móvil) 🤖
**Objetivo**: Verificar integración con Ollama/LLM.
1. En la Web o Móvil, abre el Chat.
2. Pregunta: *"¿Qué productos me recomiendas para programar?"* o *"¿Tienen laptops?"*.
3. **Validación**: El asistente debe responder coherentemente.

### 7. Chat de Voz (Móvil) 🎤
**Objetivo**: Verificar reconocimiento de voz (Whisper) y síntesis (Piper).
1. En la App Móvil, ve a la pantalla de Chat.
2. Mantén presionado el icono de **Micrófono** (se pondrá rojo).
3. Di en voz alta: *"Quiero comprar unos audífonos"*.
4. Suelta el botón.
5. **Validación**:
   - Tu texto aparece transcrito en el chat.
   - El bot responde con texto.
   - **Escuchas** la respuesta del bot en audio.

---

## Solución de Problemas

- **Error en Face ID**: Asegúrate de que la iluminación sea buena. Revisa los logs de `ai-service`: `docker logs ecommerceai-pro-ai-service-1`.
- **App Móvil no conecta**: Verifica que tu móvil y PC estén en la misma red WiFi y que hayas configurado la IP correcta en `flutter_app/lib/config/api_config.dart` (no uses `localhost` en dispositivo físico).
- **n8n no recibe datos**: Asegúrate de que el workflow esté **Activo** (switch verde arriba a la derecha).
