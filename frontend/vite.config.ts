import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {fileURLToPath} from 'url';
import {defineConfig,loadEnv} from 'vite';

const frontendRoot = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(frontendRoot,'..');

export default defineConfig(({mode}) => {
  const env=loadEnv(mode,workspaceRoot,'');
  const apiTarget=`http://127.0.0.1:${env.API_PORT||5000}`;
  return {
    root: frontendRoot,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(frontendRoot, 'src'),
        '@shared': path.resolve(workspaceRoot, 'shared'),
      },
    },
    cacheDir: path.resolve(workspaceRoot,'node_modules/.vite-frontend'),
    server: {
      port: 3000,
      proxy: { '/api': apiTarget },
      fs: { allow: [workspaceRoot] },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify — file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: { outDir: path.resolve(workspaceRoot,'dist'), emptyOutDir: true },
  };
});
