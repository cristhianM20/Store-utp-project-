import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Importaciones UTP",
  description: "Tienda universitaria con IA - Estilo Clásico",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        {/* Header Clásico */}
        <header className="header">
          <div className="header-content">
            <h1>🛒 Importaciones UTP</h1>
            <p>Tu tienda universitaria de confianza - Ahora con Inteligencia Artificial</p>
          </div>
        </header>

        {/* Barra de Navegación */}
        <nav className="nav-bar">
          <div className="nav-content">
            <ul>
              <li><a href="/">Inicio</a></li>
              <li><a href="/products">Productos</a></li>
              <li><a href="/cart">Carrito</a></li>
              <li><a href="/login">Iniciar Sesión</a></li>
              <li><a href="/register">Registrarse</a></li>
              <li><a href="/dashboard">Mi Cuenta</a></li>
              <li><a href="/admin">Administración</a></li>
            </ul>
          </div>
        </nav>

        {/* Contenido Principal */}
        <main>{children}</main>

        {/* Footer Clásico */}
        <footer className="footer">
          <div className="footer-content">
            <p>&copy; 2024 Importaciones UTP. Todos los derechos reservados.</p>
            <p>Desarrollado con Next.js + Spring Boot + IA | Estilo Clásico 2010s</p>
            <p>Contacto: info@importacionesutp.com | Tel: (555) 123-4567</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
