# Chilaquiles App

Aplicación web para pedidos de chilaquiles en línea con panel administrativo completo.

## Características principales

- Sistema de pedidos en línea con personalización de chilaquiles
- Panel administrativo con roles diferenciados (Admin, Cocina, Meseros, Caja)
- Gestión de inventario y seguimiento de pedidos
- Sistema de autenticación con JWT
- Flujo completo de estados de pedidos (pendiente, pagado, preparando, listo, entregado)

## Tecnologías utilizadas

- Frontend: React.js con Next.js 13.4
- Estilos: Bootstrap 5
- Autenticación: JWT y jose
- Base de datos: Prisma con base de datos relacional
- Despliegue: GitHub Pages

## Estructura del proyecto

```
chilaquiles-app/
├── src/
│   ├── components/     # Componentes React reutilizables
│   ├── pages/         # Páginas de la aplicación
│   ├── styles/        # Estilos globales
│   └── utils/         # Utilidades y helpers
├── public/            # Archivos estáticos
└── docs/             # Documentación adicional
```

## Instalación

1. Instalar Node.js
2. Clonar el repositorio: `git clone https://github.com/vtoriomanzarek/chilaquiles-app.git`
3. Instalar dependencias: `npm install`
4. Configurar variables de entorno: Copiar `.env.example` a `.env` y configurar
5. Ejecutar en desarrollo: `npm run dev`

## Despliegue en GitHub Pages

Esta aplicación está configurada para desplegarse automáticamente en GitHub Pages mediante GitHub Actions:

1. Cada push a la rama `main` activará el flujo de trabajo de despliegue
2. El sitio estará disponible en: https://vtoriomanzarek.github.io/chilaquiles-app/

## Usuarios de prueba

- Administrador: admin@chilaquiles.com
- Cocina: cocina@chilaquiles.com
- Mesero: mesero@chilaquiles.com
- Cajero: caja@chilaquiles.com

Todos los usuarios utilizan la contraseña: `admin123` (solo en entorno de desarrollo)
