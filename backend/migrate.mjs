import 'dotenv/config';
import { createPool, migrate } from './index.mjs';

const pool=createPool();
try {
  await migrate(pool);
  const {rows}=await pool.query('SELECT version,applied_at FROM schema_migrations ORDER BY version');
  const {rows:services}=await pool.query('SELECT id,name FROM services ORDER BY id');
  console.log(JSON.stringify({database:process.env.POSTGRES_DB||'configured by DATABASE_URL',migrations:rows.map(r=>r.version),services:services.length,serviceIds:services.map(s=>s.id)},null,2));
} catch(error) {
  console.error(`Database migration failed: ${error.message}`);
  process.exitCode=1;
} finally { await pool.end(); }
