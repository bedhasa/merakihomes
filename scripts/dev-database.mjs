import { randomBytes } from 'node:crypto';
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const envPath=resolve(root,'.env.dev');
if(!existsSync(envPath)){
  const password=randomBytes(32).toString('hex');
  writeFileSync(envPath,`MERAKI_DEV_DB_PASSWORD=${password}\nDATABASE_URL=postgres://meraki_dev:${password}@127.0.0.1:55432/meraki_homes_dev\n`,{flag:'wx',mode:0o600});
}
let config=dotenv.parse(readFileSync(envPath));
const localSecrets=[];
if(!config.PGADMIN_DEFAULT_EMAIL)localSecrets.push('PGADMIN_DEFAULT_EMAIL=admin@merakihomes.com');
if(!config.PGADMIN_DEFAULT_PASSWORD)localSecrets.push(`PGADMIN_DEFAULT_PASSWORD=${randomBytes(24).toString('base64url')}`);
if(localSecrets.length){appendFileSync(envPath,`${readFileSync(envPath).toString().endsWith('\n')?'':'\n'}${localSecrets.join('\n')}\n`);config=dotenv.parse(readFileSync(envPath));}
if(!config.MERAKI_DEV_DB_PASSWORD||!config.DATABASE_URL)throw new Error('.env.dev must contain development database credentials.');
if(!config.PGADMIN_DEFAULT_EMAIL||!config.PGADMIN_DEFAULT_PASSWORD)throw new Error('.env.dev must contain local pgAdmin credentials.');
const url=new URL(config.DATABASE_URL);
if(url.hostname!=='127.0.0.1'||url.port!=='55432'||url.pathname!=='/meraki_homes_dev'||url.username!=='meraki_dev')
  throw new Error('Refusing setup: .env.dev does not point to the isolated local development database.');
process.env.DATABASE_URL=config.DATABASE_URL;
process.env.POSTGRES_DB='meraki_homes_dev';
dotenv.config({path:resolve(root,'.env')});
process.env.DATABASE_URL=config.DATABASE_URL;

const compose=spawnSync('docker',['compose','-p','meraki-homes-dev','-f','docker-compose.dev.yml','--env-file','.env.dev','up','-d','--wait'],{cwd:root,stdio:'inherit',windowsHide:true});
if(compose.status!==0)throw new Error(`Docker Compose setup failed (exit ${compose.status??'unknown'}).`);

const {createPool,migrate}=await import('../backend/index.mjs');
const pool=createPool(config.DATABASE_URL);
try{
  await migrate(pool);
  const identity=(await pool.query('SELECT current_database() AS database,current_user AS user')).rows[0];
  if(identity.database!=='meraki_homes_dev'||identity.user!=='meraki_dev')throw new Error('Database identity check failed; refusing to continue.');
  const result=await pool.query(`SELECT
    (SELECT count(*)::int FROM schema_migrations) AS migrations,
    (SELECT count(*)::int FROM services) AS services,
    (SELECT count(*)::int FROM bookings) AS bookings,
    (SELECT count(*)::int FROM customers) AS customers,
    (SELECT count(*)::int FROM workers) AS workers,
    (SELECT count(*)::int FROM payments) AS payments,
    (SELECT count(*)::int FROM booking_items) AS booking_items`);
  const counts=result.rows[0];
  if(counts.migrations!==14||counts.services<1)throw new Error('Schema verification failed.');
  console.log(JSON.stringify({database:identity.database,user:identity.user,...counts,developmentOnly:true,demoPeopleOrTransactionsSeeded:false},null,2));
}finally{await pool.end();}
