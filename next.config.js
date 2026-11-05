/** @type {import('next').NextConfig} */
const nextConfig = {
  // Database-backed pages must not become stale build-time snapshots.
  output: 'standalone',
  // Cloudflare deployment uses the supported OpenNext adapter.
  // See: https://developers.cloudflare.com/pages/framework-guides/nextjs/
  images: {
    // Use Cloudflare Image Resizing instead of Next.js built-in image optimisation
    // (not supported in the Cloudflare Workers runtime)
    loader: 'custom',
    loaderFile: './image-loader.js',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ozjlfgipfzykzrjakwzb.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

module.exports = nextConfig
