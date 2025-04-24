/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'png.pngtree.com',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig
