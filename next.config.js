require('dotenv').config();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  skipTrailingSlashRedirect: true,
  rewrites: async () => {
    try {
      return process.env.PROFILE === 'dev'
        ? JSON.parse(process.env.REWRITES_DEV)
        : JSON.parse(process.env.REWRITES_PROD);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('No environment variable for rewrites');
      // eslint-disable-next-line no-console
      console.log(
        'Rewrites from env:',
        process.env.PROFILE === 'dev'
          ? JSON.parse(process.env.REWRITES_DEV)
          : JSON.parse(process.env.REWRITES_PROD),
      );
      return [];
    }
  },
};

module.exports = nextConfig;
