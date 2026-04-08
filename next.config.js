/** @type {import('next').NextConfig} */
const nextConfig = {
  // Render deployment uses standalone output
  output: 'standalone',
  experimental: {
    serverActions: {
      // Allow GitHub Codespaces and local dev origins
      allowedOrigins: ['localhost:3000', '*.app.github.dev', 'beststeward.com', 'www.beststeward.com'],
    },
    // Disable client-side router cache so every tab navigation fetches fresh data
    staleTimes: {
      dynamic: 0,
      static: 0,
    },
  },
};

module.exports = nextConfig;
