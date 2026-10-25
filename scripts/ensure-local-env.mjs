import { existsSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';

if (existsSync('.env')) {
  console.log('Keeping the existing .env file.');
} else {
  const password = randomBytes(24).toString('hex');
  const secret = randomBytes(48).toString('hex');
  const values = [
    'POSTGRES_DB=meraki_homes',
    'POSTGRES_USER=meraki_app',
    `POSTGRES_PASSWORD=${password}`,
    'POSTGRES_HOST_PORT=5432',
    `DATABASE_URL=postgres://meraki_app:${password}@localhost:5432/meraki_homes`,
    'API_PORT=5000',
    `SESSION_SECRET=${secret}`,
    'BOOTSTRAP_STAFF_NAME=',
    'BOOTSTRAP_STAFF_EMAIL=',
    'BOOTSTRAP_STAFF_PASSWORD=',
    '',
  ];
  writeFileSync('.env', values.join('\n'), { flag: 'wx', mode: 0o600 });
  console.log('Created a local .env with random credentials. It is ignored by Git.');
}
