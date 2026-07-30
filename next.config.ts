import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // MVP: comerciantes colam URLs de imagem livremente (sem upload próprio ainda),
    // por isso liberamos qualquer host https. Em produção, restrinja a um CDN
    // conhecido (ex: Cloudinary/S3) assim que o upload de imagens for implementado.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
