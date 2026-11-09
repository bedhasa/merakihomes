import { loadDevDatabaseConfig } from './dev-config.mjs';

Object.assign(process.env,loadDevDatabaseConfig());
const { createPool,migrate }=await import('../backend/index.mjs');
const pool=createPool();
try{
  await migrate(pool);
  const identity=(await pool.query('SELECT current_database() AS database,current_user AS user')).rows[0];
  if(identity.database!=='meraki_homes_dev'||identity.user!=='meraki_dev')throw new Error('Refusing to report success for a non-development database.');
  const versions=(await pool.query('SELECT version FROM schema_migrations ORDER BY version')).rows.map(row=>row.version);
  console.log(JSON.stringify({database:identity.database,user:identity.user,migrations:versions},null,2));
}finally{await pool.end();}
