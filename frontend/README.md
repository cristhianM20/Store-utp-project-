# EcommerceAI-Pro Frontend 🖥️

Interfaz web moderna para **EcommerceAI-Pro**, construida con Next.js 14 y Tailwind CSS.

## 🌟 Características

- **Asistente de IA**: Chatbot integrado impulsado por Qwen 2.5 (Ollama).
- **Dashboard de Usuario**: Historial de pedidos y perfil.
- **Panel de Administración**: Gestión de productos e inventario.
- **Login Biomérico**: Soporte para autenticación facial (vía webcam).

## ⚙️ Configuración

### 1. Variables de Entorno
Crea o edita `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_AI_URL=http://localhost:8000
```

### 2. Ejecutar en Desarrollo

```bash
npm run dev
```

Accede a `http://localhost:3000`.

Para documentación completa del sistema, ver el [README Principal](../README.md).
