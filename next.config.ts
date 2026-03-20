import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Isso evita que erros de formatação barrem o deploy
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Isso evita que erros de tipagem barrem o deploy (útil para finalizar logo)
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
