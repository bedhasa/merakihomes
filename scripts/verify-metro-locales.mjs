/**
 * Smoke-test Metro alias wiring for shared locale JSON.
 * Full `expo export` needs Node >= 22 (Expo 58); this checks the same paths Metro uses.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const workspaceRoot = path.resolve('.');
const mobileRoot = path.join(workspaceRoot, 'meraki-homes-mobile');
const metroConfigPath = path.join(mobileRoot, 'metro.config.js');
const require = createRequire(import.meta.url);

const config = require(metroConfigPath);
const aliasRoot = config.resolver?.extraNodeModules?.['@shared'];
if (!aliasRoot) throw new Error('metro.config.js is missing @shared in extraNodeModules');
if (path.resolve(aliasRoot) !== path.join(workspaceRoot, 'shared')) {
  throw new Error(`@shared alias points to unexpected path: ${aliasRoot}`);
}

const watchFolders = config.watchFolders || [];
if (!watchFolders.some((folder) => path.resolve(folder) === workspaceRoot)) {
  throw new Error('metro watchFolders does not include the workspace root');
}

const targets = [
  path.join(aliasRoot, 'locales/en.json'),
  path.join(aliasRoot, 'locales/am.json'),
  path.join(aliasRoot, 'locales/index.ts'),
];
for (const filePath of targets) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing Metro-visible file: ${filePath}`);
  console.log(`ok ${path.relative(workspaceRoot, filePath)}`);
}

const en = JSON.parse(fs.readFileSync(targets[0], 'utf8'));
const am = JSON.parse(fs.readFileSync(targets[1], 'utf8'));
if (!en.nav?.home || !am.nav?.home) throw new Error('Locale JSON failed to load via file URL');
if (en.nav.home === am.nav.home) throw new Error('Expected en/am nav.home to differ');

console.log(`metro locale alias passed (${am.nav.home})`);
