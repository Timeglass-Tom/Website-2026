import type { NextConfig } from 'next';

/**
 * The earn site is served from the /earn subpath of timeglass.ai — not a
 * subdomain — so it shares the apex origin (and therefore cookies and trust)
 * with the main marketing site. Every route below is authored as if it were at
 * the root; Next prefixes it with basePath at build time.
 */
const nextConfig: NextConfig = {
  basePath: '/earn',
  reactStrictMode: true,
};

export default nextConfig;
