/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
  // The generator route reads library source files at runtime to copy
  // them into the generated project. Tell Vercel to bundle them with
  // the function so fs.readFile works in production.
  outputFileTracingIncludes: {
    "/api/studio/projects/[id]/generate": [
      "./components/library/**/*",
      "./app/library.css",
    ],
  },
};
module.exports = nextConfig;
