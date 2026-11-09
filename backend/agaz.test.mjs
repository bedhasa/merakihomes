import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { createApp, migrate } from './index.mjs';

async function fixture(t) {
  process.env.SESSION_SECRET = 'test-session-secret-for-agaz-suite-with-32-bytes';
  const db = new PGlite();
  const pool = { query: (...args) => db.query(...args), connect: async () => ({ query: (...args) => db.query(...args), release() {} }) };
  await migrate(pool, { skipBtreeGist: true });
  const server = createServer(createApp({ pool }));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  t.after(async () => { server.close(); await db.close(); });
  return { base, db };
}
const post = (base, path, body, headers = {}) => fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });

test('Agaz permits guest entry, validates messages and returns a clear configuration error without Gemini', async t => {
  const { base } = await fixture(t);
  assert.equal((await fetch(base + '/api/agaz/conversations')).status, 401);
  assert.equal((await post(base, '/api/agaz/chat', { message: '   ', visitorId: 'bad' })).status, 400);
  assert.equal((await post(base, '/api/agaz/chat', { message: 'Hello', visitorId: 'bad' })).status, 400);
  const originalKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  try {
    const visitorId = '550e8400-e29b-41d4-a716-446655440000';
    const response = await post(base, '/api/agaz/chat', { message: 'What services do you offer?', visitorId, language: 'en' });
    assert.equal(response.status, 503);
    assert.match((await response.json()).error.message, /not configured/i);
  } finally {
    if (originalKey !== undefined) process.env.GEMINI_API_KEY = originalKey;
  }
});

test('Agaz conversation access and deletion enforce customer ownership and visitor session keys', async t => {
  const { base, db } = await fixture(t);
  const first = await post(base, '/api/mobile/auth/register', { name: 'Agaz Customer One', email: 'agaz-one@example.test', phone: '+251911222333', password: 'CustomerPassword1' }).then(r => r.json());
  const second = await post(base, '/api/mobile/auth/register', { name: 'Agaz Customer Two', email: 'agaz-two@example.test', phone: '+251911222334', password: 'CustomerPassword1' }).then(r => r.json());
  const firstConversation = (await db.query(`INSERT INTO agaz_conversations(customer_id,language,title,expires_at) VALUES($1,'en','First chat',now()+interval '90 days') RETURNING id`, [first.customer.id])).rows[0].id;
  const secondConversation = (await db.query(`INSERT INTO agaz_conversations(customer_id,language,title,expires_at) VALUES($1,'en','Second chat',now()+interval '90 days') RETURNING id`, [second.customer.id])).rows[0].id;
  await db.query(`INSERT INTO agaz_messages(conversation_id,role,content) VALUES($1,'user','Need help with a leaking tap.'),($1,'model','I can help you find the right service.')`, [firstConversation]);
  const ownerHeaders = { Authorization: `Bearer ${first.accessToken}` };
  const otherHeaders = { Authorization: `Bearer ${second.accessToken}` };
  const history = await fetch(`${base}/api/agaz/conversations/${firstConversation}`, { headers: ownerHeaders });
  assert.equal(history.status, 200);
  assert.equal((await history.json()).messages.length, 2);
  assert.equal((await fetch(`${base}/api/agaz/conversations/${firstConversation}`, { headers: otherHeaders })).status, 404);
  assert.equal((await fetch(`${base}/api/agaz/conversations/${secondConversation}`, { method: 'DELETE', headers: ownerHeaders })).status, 404);

  const visitorId = '550e8400-e29b-41d4-a716-446655440000';
  const visitorHash = createHash('sha256').update(visitorId).digest('hex');
  const visitorConversation = (await db.query(`INSERT INTO agaz_conversations(visitor_key_hash,language,title,expires_at) VALUES($1,'auto','Visitor chat',now()+interval '24 hours') RETURNING id`, [visitorHash])).rows[0].id;
  assert.equal((await fetch(`${base}/api/agaz/conversations/${visitorConversation}?visitorId=${visitorId}`)).status, 200);
  assert.equal((await fetch(`${base}/api/agaz/conversations/${visitorConversation}?visitorId=550e8400-e29b-41d4-a716-446655440001`)).status, 404);
  assert.equal((await fetch(`${base}/api/agaz/conversations/${visitorConversation}?visitorId=${visitorId}`, { method: 'DELETE' })).status, 200);
});
