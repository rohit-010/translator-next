/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    WORD_COUNT: 100,
    TRANSLATE_API: `https://translator-api-nsp0.onrender.com/translate`,
  },
};

module.exports = nextConfig;
