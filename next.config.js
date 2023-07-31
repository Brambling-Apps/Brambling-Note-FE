require('dotenv').config();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  skipTrailingSlashRedirect: true,
  rewrites: async () => {
    if (process.env.PROFILE === 'dev') {
      try {
        return JSON.parse(process.env.REWRITES_DEV);
      } catch (e) {
        return [];
      }
    } else {
      try {
        return JSON.parse(process.env.REWRITES_PROD);
      } catch (e) {
        return [];
      }
    }
  },
};

module.exports = nextConfig;
