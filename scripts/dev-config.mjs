import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import pg from 'pg';

const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const devEnvPath=resolve(root,'.env.dev');
const localEnvPath=resolve(root,'.env');
const {Client}=pg;

function loadDockerConfig(){
  if(!existsSync(devEnvPath))return null;
  const config=dotenv.parse(readFileSync(devEnvPath));
  if(!config.MERAKI_DEV_DB_PASSWORD||!config.DATABASE_URL)throw new Error('.env.dev must contain development database credentials.');
  const url=new URL(config.DATABASE_URL);
  if(url.hostname!=='127.0.0.1'||url.port!=='55432'||url.pathname!=='/meraki_homes_dev'||url.username!=='meraki_dev'||decodeURIComponent(url.password)!==config.MERAKI_DEV_DB_PASSWORD)
    throw new Error('Refusing to run: .env.dev does not point to the isolated local development database.');
  return config;
}

async function isDockerDatabaseAvailable(config){
  const client=new Client({connectionString:config.DATABASE_URL,connectionTimeoutMillis:1500});
  try{
    await client.connect();
  }catch{
    return false;
  }
  try{
    const result=await client.query('SELECT current_database() AS database,current_user AS user');
    const identity=result.rows[0];
    if(identity.database!=='meraki_homes_dev'||identity.user!=='meraki_dev')
      throw new Error('Refusing to use the Docker development database: the connected database identity does not match the isolated development database.');
    return true;
  }finally{
    await client.end();
  }
}

function loadLocalConfig(){
  if(!existsSync(localEnvPath))throw new Error('Local database config is missing. Add DATABASE_URL to .env.');
  const config=dotenv.parse(readFileSync(localEnvPath));
  if(!config.DATABASE_URL)throw new Error('.env must contain DATABASE_URL for the local PostgreSQL database.');
  const url=new URL(config.DATABASE_URL);
  if(!['localhost','127.0.0.1'].includes(url.hostname)||url.port!=='5432'||url.pathname!=='/meraki_homes'||url.username!=='meraki_app')
    throw new Error('Refusing to use local PostgreSQL: .env DATABASE_URL must target meraki_app@localhost:5432/meraki_homes.');

  if(process.env.DATABASE_URL){
    const activeUrl=new URL(process.env.DATABASE_URL);
    if(activeUrl.hostname!==url.hostname||activeUrl.port!==url.port||activeUrl.pathname!==url.pathname||activeUrl.username!==url.username||activeUrl.password!==url.password)
      throw new Error('Refusing to replace DATABASE_URL: the existing value differs from the local database configured in .env.');
  }

  // Set only the missing connection URL; never replace an existing DATABASE_URL.
  // backend/index.mjs loads the rest of .env when the API starts.
  process.env.DATABASE_URL??=config.DATABASE_URL;
  const {DATABASE_URL,...overrides}=config;
  return overrides;
}

export async function loadDevDatabaseConfig(){
  const dockerConfig=loadDockerConfig();
  if(dockerConfig&&await isDockerDatabaseAvailable(dockerConfig))return dockerConfig;
  return loadLocalConfig();
}
