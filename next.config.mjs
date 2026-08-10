/** @type {import('next').NextConfig} */
// Production is served from https://banukajanith2.github.io/Portfolio, so every
// asset needs that prefix. next/image and next/link apply it automatically; raw
// <a href> and plain string paths need NEXT_PUBLIC_BASE_PATH below.
// Empty in dev so `npm run dev` stays at http://localhost:3000.
const basePath = process.env.NODE_ENV === "production" ? "/Portfolio" : "";

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
  // transformers.js reaches for Node built-ins and, more awkwardly, for
  // onnxruntime-node - which ships prebuilt .node binaries for six platforms.
  // Webpack tries to parse those as JavaScript and the build dies on the first
  // byte. Nothing here is reachable from a static export anyway: the package is
  // only ever pulled in through a browser-only dynamic import, and in the
  // browser it uses onnxruntime-web (WASM) instead.
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    // `false` tells webpack to resolve these to an empty module rather than
    // bundle them. The trailing $ pins the match to the exact request, so
    // deep imports inside onnxruntime-web are unaffected.
    config.resolve.alias = {
      ...config.resolve.alias,
      "onnxruntime-node$": false,
      sharp$: false,
    };

    // Lets webpack emit the WASM binary as an asset instead of failing on an
    // unknown module type.
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    return config;
  },
};

export default nextConfig;
