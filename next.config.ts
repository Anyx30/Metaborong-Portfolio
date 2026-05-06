import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel Blob serves user-uploaded images from a per-store subdomain like
  // `https://<storeId>.public.blob.vercel-storage.com/<path>`. Allow any
  // subdomain of public.blob.vercel-storage.com so next/image can fetch and
  // optimise our uploads. Locked down to https + that exact host suffix so
  // a different upload origin can't be used to circumvent the allowlist.
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
    ],
  },
};

export default nextConfig;
