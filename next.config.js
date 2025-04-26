/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/chilaquiles-app',
  assetPrefix: '/chilaquiles-app/',
  trailingSlash: true,
  // Excluir rutas de API y páginas que requieren servidor
  distDir: 'out',
  // Excluir rutas de API y páginas protegidas durante la exportación estática
  exportPathMap: async function () {
    return {
      '/': { page: '/' },
      // Añade aquí otras páginas estáticas que quieras incluir
    };
  },
}

module.exports = nextConfig
