import 'dotenv/config';
import { randomBytes, scryptSync } from 'node:crypto';
import { createPool, migrate } from './index.mjs';

const bootstrap=process.argv.includes('--bootstrap');
const name=process.env[bootstrap?'BOOTSTRAP_STAFF_NAME':'STAFF_NAME'];
const email=process.env[bootstrap?'BOOTSTRAP_STAFF_EMAIL':'STAFF_EMAIL'];
const password=process.env[bootstrap?'BOOTSTRAP_STAFF_PASSWORD':'STAFF_PASSWORD'];
const role=bootstrap?'admin':process.env.STAFF_ROLE||'operations';
if (!name || !email || !password || !['admin','operations'].includes(role) || password.length < 14) {
  console.error(bootstrap?'Set BOOTSTRAP_STAFF_NAME, BOOTSTRAP_STAFF_EMAIL and BOOTSTRAP_STAFF_PASSWORD (14+ characters) in .env.':'Set STAFF_NAME, STAFF_EMAIL, STAFF_PASSWORD (14+ characters), and STAFF_ROLE (admin or operations) in the environment.');
  process.exit(1);
}
const pool=createPool();
try {
  await migrate(pool);
  if(bootstrap&&(await pool.query('SELECT 1 FROM staff_users LIMIT 1')).rowCount){console.error('A staff account already exists; bootstrap can only create the first administrator.');process.exitCode=1;}
  else {
  const salt=randomBytes(16);
  const hash=`scrypt$${salt.toString('hex')}$${scryptSync(password,salt,64).toString('hex')}`;
  await pool.query('INSERT INTO staff_users(full_name,email,password_hash,role_id) VALUES($1,lower($2),$3,$4)',[name.trim(),email.trim(),hash,role]);
  console.log(`Created ${role} staff account for ${email.trim().toLowerCase()}.`);
  }
} catch(error) {
  console.error(`Staff account was not created: ${error.message}`);
  process.exitCode=1;
} finally { await pool.end(); }
