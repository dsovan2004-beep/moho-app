/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for @cloudflare/next-on-pages
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
