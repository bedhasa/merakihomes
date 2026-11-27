import { loadDevDatabaseConfig } from './dev-config.mjs';

Object.assign(process.env,await loadDevDatabaseConfig());
const { createPool,migrate }=await import('../backend/index.mjs');
const pool=createPool();
try{
  await migrate(pool);
  const identity=(await pool.query('SELECT current_database() AS database,current_user AS user')).rows[0];
  const configuredUrl=new URL(process.env.DATABASE_URL);
  if(identity.database!==decodeURIComponent(configuredUrl.pathname.slice(1))||identity.user!==decodeURIComponent(configuredUrl.username))throw new Error('Refusing to report success for a database that does not match the selected development configuration.');
  const versions=(await pool.query('SELECT version FROM schema_migrations ORDER BY version')).rows.map(row=>row.version);
  console.log(JSON.stringify({database:identity.database,user:identity.user,migrations:versions},null,2));
}finally{await pool.end();}
