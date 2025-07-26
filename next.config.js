/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    QWEN_API_KEY: process.env.QWEN_API_KEY,
    QWEN_API_URL: process.env.QWEN_API_URL,
  },
}

module.exports = nextConfig
