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

  // SERVICES_PLAN.md § 2 — preserve inbound links for the `ai-agents` → `ai`
  // rename and the two Product Studio slug renames. 308 (permanent) so search
  // engines transfer authority to the new canonical URL. Order matters: list
  // the more-specific leaf redirects before the pillar-level catch-all so the
  // first match wins inside Next's routing.
  async redirects() {
    return [
      {
        source: '/services/ai-agents/agentic-ai-systems',
        destination: '/services/ai/agentic-ai-systems',
        permanent: true,
      },
      {
        source: '/services/ai-agents/rag-knowledge-systems',
        destination: '/services/ai/rag-retrieval-pipelines',
        permanent: true,
      },
      {
        source: '/services/ai-agents/generative-ai-development',
        destination: '/services/ai/llm-integration-architecture',
        permanent: true,
      },
      {
        source: '/services/ai-agents/voice-agent-integration',
        destination: '/services/ai/conversational-agents-assistants',
        permanent: true,
      },
      {
        source: '/services/ai-agents/ai-systems-integration',
        destination: '/services/ai/llm-integration-architecture',
        permanent: true,
      },
      {
        source: '/services/ai-agents/ai-workflow-automation',
        destination: '/services/ai',
        permanent: true,
      },
      {
        source: '/services/ai-agents',
        destination: '/services/ai',
        permanent: true,
      },
      {
        source: '/services/product-studio/mvp-software-development',
        destination: '/services/product-studio/mvp-development',
        permanent: true,
      },
      {
        source: '/services/product-studio/b2b-software-development',
        destination: '/services/product-studio/b2b-multi-tenant-platforms',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
