import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const envPath=resolve(root,'.env.dev');

export function loadDevDatabaseConfig(){
  if(!existsSync(envPath))throw new Error('Development database config is missing. Run npm run db:dev:setup first.');
  const config=dotenv.parse(readFileSync(envPath));
  if(!config.MERAKI_DEV_DB_PASSWORD||!config.DATABASE_URL)throw new Error('.env.dev must contain development database credentials.');
  const url=new URL(config.DATABASE_URL);
  if(url.hostname!=='127.0.0.1'||url.port!=='55432'||url.pathname!=='/meraki_homes_dev'||url.username!=='meraki_dev'||decodeURIComponent(url.password)!==config.MERAKI_DEV_DB_PASSWORD)
    throw new Error('Refusing to run: .env.dev does not point to the isolated local development database.');
  return config;
}
