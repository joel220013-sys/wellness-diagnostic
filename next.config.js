/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com', 'assets.co'],
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
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
