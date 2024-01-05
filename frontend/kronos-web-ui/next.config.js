/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  basePath: "/kronos",
  env: {
    NEXT_PUBLIC_KRONOS_HTTP_URL: process.env.NEXT_PUBLIC_KRONOS_HTTP_URL,
  },
};

module.exports = nextConfig;
