/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ['placeholder.svg', 'blob.v0.dev'],
  },
  // Disable static optimization to prevent SSR issues
  experimental: {
    forceSwcTransforms: true,
  },
  // Force dynamic rendering
  dynamic: 'force-dynamic',
}

export default nextConfig
