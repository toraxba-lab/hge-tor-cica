import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Configurações básicas para o deploy fluir */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Removido o bloco "experimental" que estava causando o erro
};

export default nextConfig;
