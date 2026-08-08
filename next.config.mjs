/** @type {import('next').NextConfig} */
// Served from https://banukajanith2.github.io/Portfolio, so every asset needs
// this prefix. next/image and next/link apply it automatically; raw <a href>
// and plain string paths need NEXT_PUBLIC_BASE_PATH below.
const basePath = "/Portfolio";

const nextConfig = {
  // Emit a fully static site to ./out for GitHub Pages.
  output: "export",
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  images: {
    // GitHub Pages has no image optimization server.
    unoptimized: true,
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
