const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');
const config = getDefaultConfig(projectRoot);

// The mobile app imports the shared API from the repository root. Make that
// workspace source visible to Metro and mirror the @shared TypeScript alias.
config.watchFolders = [...(config.watchFolders || []), workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  '@shared': path.resolve(workspaceRoot, 'shared'),
};

module.exports = config;
