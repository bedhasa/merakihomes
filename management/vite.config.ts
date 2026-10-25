import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig,loadEnv } from 'vite';

const managementRoot=path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot=path.resolve(managementRoot,'..');
export default defineConfig(({mode})=>{
const env=loadEnv(mode,workspaceRoot,'');
return {
  root:path.resolve(managementRoot,'app'),
  plugins:[react(),tailwindcss()],
  resolve:{alias:{'@':path.resolve(managementRoot,'src'),'@shared':path.resolve(workspaceRoot,'shared')}},
  cacheDir:path.resolve(workspaceRoot,'node_modules/.vite-management'),
  server:{port:3004,strictPort:true,proxy:{'/api':`http://127.0.0.1:${env.API_PORT||5000}`},fs:{allow:[workspaceRoot]}},
  build:{outDir:path.resolve(workspaceRoot,'dist-management'),emptyOutDir:true},
};
});
