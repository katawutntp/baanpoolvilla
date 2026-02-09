/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['3c88-171-97-63-148.ngrok-free.app'],
  images: {
    domains: ['firebasestorage.googleapis.com', 'localhost', 'profile.line-scdn.net', 'obs.line-scdn.net'],
    unoptimized: false,
  },
}

module.exports = nextConfig
