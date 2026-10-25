import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { createPool } from './index.mjs';

const seed=JSON.parse(readFileSync(new URL('./seed.json',import.meta.url),'utf8'));
const expected=seed.map(s=>({id:s.id,name:s.name,description:s.description,pricing_type:s.pricing_type,estimated_duration_minutes:s.duration,image:s.image}));
const pool=createPool();
try {
  const identity=(await pool.query('SELECT current_database() AS database,current_user AS user,version() AS version')).rows[0];
  const migrations=(await pool.query('SELECT version FROM schema_migrations ORDER BY version')).rows.map(r=>r.version);
  const services=(await pool.query('SELECT id,name,description,pricing_type,estimated_duration_minutes,image FROM services WHERE is_active=TRUE ORDER BY id')).rows;
  const integrity=(await pool.query(`SELECT
    count(*) FILTER (WHERE contype='f')::int AS foreign_keys,
    count(*) FILTER (WHERE contype='c')::int AS check_constraints
    FROM pg_constraint WHERE connamespace=current_schema()::regnamespace`)).rows[0];
  const indexes=(await pool.query(`SELECT count(*)::int AS count FROM pg_indexes WHERE schemaname=current_schema()`)).rows[0].count;
  const byId=new Map(services.map(s=>[s.id,s]));
  const catalogueMatchesSeed=services.length===expected.length&&expected.every(s=>{const actual=byId.get(s.id);return actual&&actual.name===s.name&&actual.description===s.description&&actual.pricing_type===s.pricing_type&&actual.estimated_duration_minutes===s.estimated_duration_minutes&&actual.image===s.image;});
  const result={...identity,postgres:identity.version,version:undefined,migrations,activeServiceCount:services.length,activeServiceIds:services.map(s=>s.id),catalogueMatchesSeed,inactiveHistoricalServiceCount:(await pool.query('SELECT count(*)::int AS count FROM services WHERE is_active=FALSE')).rows[0].count,foreignKeys:integrity.foreign_keys,checkConstraints:integrity.check_constraints,indexes};
  console.log(JSON.stringify(result,null,2));
  if(services.length!==expected.length||!catalogueMatchesSeed)throw new Error('Service seed differs from the expected catalogue or contains duplicates.');
  if(!migrations.includes('006'))throw new Error('The booking package migration has not been applied.');
  if(integrity.foreign_keys<1||integrity.check_constraints<1||indexes<1)throw new Error('Database constraints or indexes are missing.');
} catch(error) {
  console.error(`Database verification failed: ${error.message}`);
  process.exitCode=1;
} finally { await pool.end(); }
