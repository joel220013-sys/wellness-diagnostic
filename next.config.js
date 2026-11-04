/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com', 'assets.co'],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://maps.googleapis.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://maps.googleapis.com",
              "img-src 'self' data: blob: https: http: https://maps.gstatic.com https://*.googleapis.com https://*.ggpht.com https://*.google.com",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https://maps.googleapis.com https://wellness-diagnostic-backend.onrender.com http://localhost:8000 http://127.0.0.1:8000 https://*.supabase.co https://*.tile.openstreetmap.org https://nominatim.openstreetmap.org",
              "frame-src 'self' blob: data: https: https://*.r2.cloudflarestorage.com https://*.r2.dev https://*.cloudflare.com",
              "object-src 'self' blob: data: https: https://*.r2.cloudflarestorage.com https://*.r2.dev",
              "frame-ancestors 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/auth/patient',
        destination: '/patient/login',
        permanent: true,
      },
      {
        source: '/auth/admin',
        destination: '/admin/login',
        permanent: true,
      },
      {
        source: '/auth/driver',
        destination: '/driver/login',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [
        {
          source: '/api/:path*',
          destination: `${backendUrl}/api/:path*`,
        },
      ],
    };
  },
};

module.exports = nextConfig;
