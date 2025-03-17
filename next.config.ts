import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    turbo: {
      resolveAlias: {
        canvas: "./empty-module.ts",
      },
    },
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/api/:path*",
          destination: "/api/:path*",
          has: [
            {
              type: "header",
              key: "content-length",
              value: "(?!(?:[0-9]|[0-9][0-9]|[0-9][0-9][0-9]|[0-9][0-9][0-9][0-9]|[0-9][0-9][0-9][0-9][0-9]|[0-9][0-9][0-9][0-9][0-9][0-9]|[0-9][0-9][0-9][0-9][0-9][0-9][0-9]|1[0-9]{7}|10[0-9]{6})$)",
            },
          ],
          missing: [
            {
              type: "header",
              key: "content-length",
            },
          ],
        },
      ],
    };
  },
}

export default nextConfig;
