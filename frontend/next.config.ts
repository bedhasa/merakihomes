import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnvConfig } from '@next/env';
import type { NextConfig } from 'next';

// Next's project root is frontend/, but local secrets and public map settings
// stay in the existing workspace-level .env file.
const frontendDir = path.dirname(fileURLToPath(import.meta.url));
loadEnvConfig(path.resolve(frontendDir, '..'));

const config: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  agentRules: false,
};

export default config;
