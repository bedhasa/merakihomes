import test from 'node:test';
import assert from 'node:assert/strict';
import {
  agazPublicMessage,
  backoffMs,
  classifyGeminiError,
  geminiModelsFromEnv,
  generateWithResilience,
  truncateHistory,
} from './agaz-gemini.mjs';

test('classifies Gemini 429 daily quota separately from per-minute limits', () => {
  const daily = classifyGeminiError({ status: 429, message: 'You exceeded your current quota. generate_requests_per_day' });
  assert.equal(daily.category, 'quota_daily');
  assert.equal(daily.retryable, false);
  assert.equal(daily.publicCode, 'quota_daily');
  const rpm = classifyGeminiError({ status: 429, message: 'RESOURCE_EXHAUSTED: requests per minute' });
  assert.equal(rpm.category, 'rate_limit');
  assert.equal(rpm.retryable, true);
  const tokens = classifyGeminiError({ status: 429, message: 'TokensPerMinute quota exceeded' });
  assert.equal(tokens.category, 'quota_tokens');
  assert.equal(tokens.retryable, true);
});

test('classifies auth, missing model, busy, timeout and network failures', () => {
  assert.equal(classifyGeminiError({ status: 403, message: 'API key not valid' }).category, 'auth');
  assert.equal(classifyGeminiError({ status: 404, message: 'models/gemini-3.8-flash is not found' }).category, 'model_not_found');
  assert.equal(classifyGeminiError({ status: 503, message: 'The model is overloaded' }).category, 'busy');
  assert.equal(classifyGeminiError({ name: 'TimeoutError' }).category, 'timeout');
  assert.equal(classifyGeminiError({ status: 504, message: 'gateway timeout' }).category, 'timeout');
  assert.equal(classifyGeminiError({ message: 'fetch failed', cause: { code: 'ENOTFOUND' } }).category, 'network');
  assert.equal(classifyGeminiError({ error: { error: { code: 403, message: 'API key not valid' } } }).category, 'auth');
});

test('retries 504 timeouts a limited number of times', async () => {
  let calls = 0;
  await assert.rejects(() => generateWithResilience({
    models: ['gemini-2.5-flash'],
    maxRetries: 2,
    sleep: async () => undefined,
    generate: async () => {
      calls += 1;
      throw Object.assign(new Error('gateway timeout'), { status: 504 });
    },
  }), error => error.classified.category === 'timeout');
  assert.equal(calls, 3);
});

test('retries busy errors with backoff and does not retry daily quota', async () => {
  let busyCalls = 0;
  const busy = await generateWithResilience({
    models: ['gemini-2.5-flash'],
    maxRetries: 2,
    sleep: async () => undefined,
    generate: async () => {
      busyCalls += 1;
      if (busyCalls < 3) throw Object.assign(new Error('overloaded'), { status: 503 });
      return { text: '{"message":"ok","language":"en"}' };
    },
  });
  assert.equal(busy.result.text.includes('ok'), true);
  assert.equal(busy.retries, 2);

  await assert.rejects(() => generateWithResilience({
    models: ['gemini-2.5-flash'],
    maxRetries: 3,
    sleep: async () => undefined,
    generate: async () => { throw Object.assign(new Error('free tier per day'), { status: 429 }); },
  }), error => error.classified.category === 'quota_daily');
});

test('falls back to the next model when the primary model is missing', async () => {
  const result = await generateWithResilience({
    models: ['missing-model', 'gemini-2.0-flash'],
    maxRetries: 0,
    sleep: async () => undefined,
    generate: async model => {
      if (model === 'missing-model') throw Object.assign(new Error('not found'), { status: 404 });
      return { text: 'ok', model };
    },
  });
  assert.equal(result.model, 'gemini-2.0-flash');
});

test('truncates history and keeps recent context', () => {
  const history = Array.from({ length: 12 }, (_, index) => ({ role: index % 2 ? 'model' : 'user', text: 'x'.repeat(900) }));
  const trimmed = truncateHistory(history);
  assert.equal(trimmed.length, 8);
  assert.equal(trimmed[0].text.length, 700);
});

test('uses configurable models and customer-safe messages', () => {
  assert.deepEqual(geminiModelsFromEnv({}), ['gemini-3.8-flash', 'gemini-3-flash-preview']);
  assert.equal(agazPublicMessage({ publicCode: 'busy' }), 'Merk is temporarily busy. Please try again shortly.');
  assert.ok(backoffMs(0, 2) >= 2000);
});
