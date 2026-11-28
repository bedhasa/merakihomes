import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnvConfig } from '@next/env';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

// Next's project root is frontend/, but local secrets and public map settings
// stay in the existing workspace-level .env file.
const frontendDir = path.dirname(fileURLToPath(import.meta.url));
loadEnvConfig(path.resolve(frontendDir, '..'));

// Path is relative to the Next project root (frontend/). Scripts use
// scripts/run-next.mjs so process.cwd() matches that directory.
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const config: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  agentRules: false,
  experimental: {
    agentUpgrade: 'security',
  },
};

export default withNextIntl(config);
