import type { NextConfig } from 'next';
import { BASE_PATH } from './src/config/site';

/**
 * The earn site is served from the /earn subpath of timeglass.ai rather than a
 * subdomain, so it shares the apex origin, and therefore cookies and trust,
 * with the main marketing site. Every route below is authored as if it were at
 * the root, and Next prefixes it with basePath at build time.
 */
const nextConfig: NextConfig = {
  basePath: BASE_PATH,
  reactStrictMode: true,
};

export default nextConfig;
