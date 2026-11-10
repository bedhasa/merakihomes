const DAILY_QUOTA = /free.?tier|per.?day|requestsperday|generate_requests_per_day|quota.*?day|daily.?limit|billing|spend(ing)? limit/i;
const TOKEN_QUOTA = /tokens.?per.?minute|input.?token|token.*quota|TokensPerMinute/i;
const RATE_LIMIT = /per.?minute|rate.?limit|resource.?exhausted|RESOURCE_EXHAUSTED/i;

export function geminiModelsFromEnv(env = process.env) {
  const primary = (env.GEMINI_MODEL || 'gemini-3.8-flash').trim();
  const fallback = (env.GEMINI_FALLBACK_MODEL || 'gemini-3-flash-preview').trim();
  const last = (env.GEMINI_LAST_RESORT_MODEL || '').trim();
  return [...new Set([primary, fallback, last].filter(Boolean))];
}

export function geminiMaxOutputTokens(env = process.env) {
  const value = Number(env.GEMINI_MAX_OUTPUT_TOKENS || 700);
  if (!Number.isInteger(value) || value < 128 || value > 2048) return 700;
  return value;
}

export function truncateHistory(messages, { maxMessages = 8, maxChars = 700 } = {}) {
  const recent = (messages || []).slice(-maxMessages);
  return recent.map(item => ({
    role: item.role,
    text: String(item.text || '').slice(0, maxChars),
  }));
}

function numericStatus(error) {
  for (const value of [error?.status, error?.statusCode, error?.error?.error?.code, error?.error?.code]) {
    const status = Number(value);
    if (Number.isInteger(status) && status > 0) return status;
  }
  return 0;
}

export function classifyGeminiError(error) {
  const status = numericStatus(error);
  const retryAfter = Number(error?.headers?.get?.('retry-after') || error?.retryAfter || 0);
  const message = String(error?.error?.error?.message || error?.error?.message || error?.message || '');
  const combined = `${message} ${JSON.stringify(error?.error || {})}`;
  const network = error?.message === 'fetch failed'
    || ['ECONNRESET', 'ENOTFOUND', 'ETIMEDOUT', 'EAI_AGAIN'].includes(error?.cause?.code || error?.code);
  const timeout = error?.name === 'AbortError' || error?.name === 'TimeoutError' || status === 504;

  if (timeout) return { category: 'timeout', retryable: true, status: status || 504, retryAfter, publicCode: 'timeout' };
  if (network) return { category: 'network', retryable: true, status: 502, retryAfter, publicCode: 'network' };
  if (status === 401 || status === 403) return { category: 'auth', retryable: false, status, retryAfter, publicCode: 'config' };
  if (status === 400) return { category: 'invalid', retryable: false, status, retryAfter, publicCode: 'invalid' };
  if (status === 404) return { category: 'model_not_found', retryable: false, status, retryAfter, publicCode: 'config' };
  if (status === 429) {
    if (DAILY_QUOTA.test(combined)) return { category: 'quota_daily', retryable: false, status: 429, retryAfter, publicCode: 'quota_daily' };
    if (TOKEN_QUOTA.test(combined)) return { category: 'quota_tokens', retryable: true, status: 429, retryAfter, publicCode: 'rate_limit' };
    return { category: 'rate_limit', retryable: true, status: 429, retryAfter, publicCode: 'rate_limit' };
  }
  if (status === 503) return { category: 'busy', retryable: true, status: 503, retryAfter, publicCode: 'busy' };
  if (status === 504) return { category: 'timeout', retryable: true, status: 504, retryAfter, publicCode: 'timeout' };
  return { category: 'provider', retryable: status >= 500, status: status || 502, retryAfter, publicCode: 'provider' };
}

export function agazPublicMessage(classified) {
  switch (classified?.publicCode) {
    case 'busy': return 'Merk is temporarily busy. Please try again shortly.';
    case 'rate_limit': return 'Merk has reached a temporary request limit. Please try again later.';
    case 'quota_daily': return 'Merk has reached a daily request limit. Please try again after the quota resets.';
    case 'timeout': return 'Merk is taking longer than usual. Please try again.';
    case 'network': return 'Please check your internet connection and try again.';
    case 'config': return 'Merk is unavailable right now. Please try again later.';
    case 'invalid': return 'Merk could not process that request. Please try a shorter message.';
    default: return 'Merk could not get a response from its AI service. Please try again.';
  }
}

export function backoffMs(attempt, retryAfterSeconds = 0, random = Math.random) {
  if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) return Math.min(8000, retryAfterSeconds * 1000);
  const base = Math.min(4000, 400 * (2 ** attempt));
  return Math.round(base * (0.6 + random() * 0.4));
}

export function logAgazGemini(event) {
  const payload = {
    event: 'agaz.gemini',
    model: event.model || null,
    durationMs: event.durationMs ?? null,
    status: event.status ?? null,
    category: event.category || null,
    retries: event.retries ?? 0,
    ok: Boolean(event.ok),
  };
  if (event.ok) console.info(JSON.stringify(payload));
  else console.error(JSON.stringify(payload));
}

export async function generateWithResilience({
  models,
  generate,
  maxRetries = 2,
  budgetMs = 60_000,
  sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms)),
}) {
  let lastError;
  let retries = 0;
  const begun = Date.now();
  for (const model of models) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const started = Date.now();
      try {
        const result = await generate(model);
        logAgazGemini({ model, durationMs: Date.now() - started, status: 200, category: 'ok', retries, ok: true });
        return { result, model, retries };
      } catch (error) {
        const classified = classifyGeminiError(error);
        lastError = Object.assign(error, { classified });
        logAgazGemini({
          model,
          durationMs: Date.now() - started,
          status: classified.status,
          category: classified.category,
          retries,
          ok: false,
        });
        const tryNextModel = classified.category === 'model_not_found' || classified.category === 'busy' || classified.category === 'timeout';
        if (Date.now() - begun >= budgetMs) throw lastError;
        if (!classified.retryable) {
          if (tryNextModel) break;
          throw lastError;
        }
        if (attempt >= maxRetries) {
          if (tryNextModel) break;
          throw lastError;
        }
        retries += 1;
        await sleep(backoffMs(attempt, classified.retryAfter));
      }
    }
  }
  throw lastError || new Error('No Gemini model returned a response.');
}
