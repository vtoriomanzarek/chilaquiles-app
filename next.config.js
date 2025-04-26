/** @type {import('next').NextConfig} */

// Detectar si estamos en modo de producción (GitHub Pages) o desarrollo (local)
const isProduction = process.env.NODE_ENV === 'production';
const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';

const nextConfig = {
  reactStrictMode: true,
  
  // Configuración condicional basada en el entorno
  ...(isGitHubPages ? {
    // Configuración para GitHub Pages (exportación estática)
    output: 'export',
    images: {
      unoptimized: true,
    },
    basePath: '/chilaquiles-app',
    assetPrefix: '/chilaquiles-app/',
    trailingSlash: true,
    distDir: 'out',
    // Excluir rutas de API y páginas protegidas durante la exportación estática
    exportPathMap: async function () {
      return {
        '/': { page: '/' },
        // Añade aquí otras páginas estáticas que quieras incluir
      };
    },
  } : {
    // Configuración para desarrollo local (funcionalidad completa)
    // No se especifica output para permitir SSR y API routes
  })
}

module.exports = nextConfig
