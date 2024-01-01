/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    WORD_COUNT: 100,
    TRANSLATE_API: `http://localhost:5700/translate`,
  },
};

module.exports = nextConfig;
