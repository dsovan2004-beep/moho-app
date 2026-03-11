// Custom image loader for Cloudflare Pages
// next/image's built-in optimization is not available in the Workers runtime,
// so we pass the src through unchanged and rely on Cloudflare's CDN.
export default function cloudflareImageLoader({ src, width, quality }) {
  return `${src}?width=${width}&quality=${quality ?? 75}`
}
