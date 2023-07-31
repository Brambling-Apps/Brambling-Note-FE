/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  skipTrailingSlashRedirect: true,
  rewrites: async () => [
    {
      source: '/api/:path*/',
      destination: 'http://localhost:9080/api/:path*/',
    },
    {
      source: '/api/:path*',
      destination: 'http://localhost:9080/api/:path*',
    },
  ],
};

module.exports = nextConfig;
