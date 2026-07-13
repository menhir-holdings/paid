import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "paid-eight.vercel.app" }],
        destination: "https://paid.menhir-holdings.com/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "paid-menhir-tech.vercel.app" }],
        destination: "https://paid.menhir-holdings.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
