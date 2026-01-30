/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración TypeScript
  typescript: {
    ignoreBuildErrors: true,
  },

  // Configuración ESLint
  eslint: {
    dirs: ['src/app', 'src/components', 'src/lib', 'src/hooks'],
    ignoreDuringBuilds: true,
  },

  // Configuración de imágenes para Supabase
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https', 
        hostname: 'supabase.com',
        port: '',
        pathname: '/**',
      }
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Headers de seguridad
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // Redirects corregidos - SOLO rutas que realmente necesitan redirect
  async redirects() {
    return [
      {
        source: '/auth',
        destination: '/auth/login',
        permanent: false,
      }
      // ✅ REMOVIDO: El redirect de '/' a '/dashboard' 
      // ✅ Ahora la landing page se mostrará normalmente
      // ✅ El middleware maneja la redirección solo para usuarios autenticados
    ];
  },

  // Configuración de compresión y optimización
  compress: true,
  poweredByHeader: false,
  trailingSlash: false,

  // Configuración de Webpack personalizada
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Reglas para archivos SVG
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },

  // Configuración actualizada para Next.js 15.3.3
  experimental: {
    optimizePackageImports: ['recharts', 'lucide-react'],
  },

  // Configuración de Turbopack (ahora estable)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // Dependencias externas del servidor (movido de experimental)
  serverExternalPackages: ['@supabase/supabase-js'],

  // Configuración de output para deploy
  output: 'standalone',

  // Configuración de logging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // Configuración de bundles
  bundlePagesRouterDependencies: true,
};

module.exports = nextConfig;