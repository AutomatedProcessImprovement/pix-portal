/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
};

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = nextConfig;
module.exports = withBundleAnalyzer({});
