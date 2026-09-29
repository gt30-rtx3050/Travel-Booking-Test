import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['*.e2b.app', '*.e2b.dev', 'localhost:3000', '127.0.0.1:3000', '0.0.0.0:3000'],
    },
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
