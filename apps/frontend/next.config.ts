import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/grafana",
        destination: "http://localhost:3100",
        permanent: false,
      },
      {
        source: "/grafana/:path*",
        destination: "http://localhost:3100/:path*",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
