import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {protocol: "https", hostname: "covers.openlibrary.org"},
      {protocol: "https", hostname: "n020z6u1luja1e9f.public.blob.vercel-storage.com"}
    ]
  }
};

export default nextConfig;
