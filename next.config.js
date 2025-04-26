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
}

module.exports = nextConfig
