/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['3c88-171-97-63-148.ngrok-free.app'],
  images: {
    domains: ['firebasestorage.googleapis.com', 'localhost', 'profile.line-scdn.net', 'obs.line-scdn.net'],
    unoptimized: false,
  },
  // เพิ่ม body size limit สำหรับ upload รูปภาพ
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
}

module.exports = nextConfig
