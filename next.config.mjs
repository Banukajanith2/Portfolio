/** @type {import('next').NextConfig} */
const nextConfig = {
  // Emit a fully static site to ./out for GitHub Pages.
  output: "export",
  images: {
    // GitHub Pages has no image optimization server.
    unoptimized: true,
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
