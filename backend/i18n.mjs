/**
 * API locale resolution + error/validation message lookup from shared/locales.
 * Customer-facing responses use Accept-Language / X-Locale; staff portal stays EN-capable.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const localesDir = resolve(here, '../shared/locales');
const uiLocales = new Set(['en', 'am']);
const defaultLocale = 'en';

function loadCatalog(id) {
  return JSON.parse(readFileSync(resolve(localesDir, `${id}.json`), 'utf8'));
}

const catalogs = {
  en: loadCatalog('en'),
  am: loadCatalog('am'),
};

export function isUiLocale(value) {
  return typeof value === 'string' && uiLocales.has(value);
}

/** Prefer X-Locale, then first Accept-Language tag that matches a UI locale. */
export function resolveRequestLocale(req) {
  const explicit = (req.get?.('X-Locale') || req.get?.('X-UI-Locale') || '').trim().toLowerCase();
  if (isUiLocale(explicit)) return explicit;

  const accept = req.get?.('Accept-Language') || '';
  for (const part of accept.split(',')) {
    const tag = part.trim().split(';')[0].toLowerCase();
    if (!tag) continue;
    const primary = tag.split('-')[0];
    if (isUiLocale(primary)) return primary;
    if (isUiLocale(tag)) return tag;
  }
  return defaultLocale;
}

function lookup(locale, namespace, key) {
  const catalog = catalogs[isUiLocale(locale) ? locale : defaultLocale];
  const bucket = catalog?.[namespace];
  if (bucket && typeof bucket[key] === 'string' && bucket[key].trim()) return bucket[key];
  const fallback = catalogs[defaultLocale]?.[namespace];
  if (fallback && typeof fallback[key] === 'string') return fallback[key];
  return null;
}

/** True when `key` is an errors.* or validation.* catalog key. */
export function hasApiMessage(key) {
  return (
    typeof key === 'string' &&
    key !== '' &&
    (lookup(defaultLocale, 'errors', key) !== null || lookup(defaultLocale, 'validation', key) !== null)
  );
}

// English error text -> catalog code. Lets plain-English apiError(...) calls be translated without
// editing every call site: when the server's English message exactly matches an errors.* value, the
// matching Amharic text is returned. English output is unchanged. Messages with ICU arguments are skipped.
const messageCodes = new Map(
  Object.entries(catalogs[defaultLocale].errors || {})
    .filter(([, text]) => typeof text === 'string' && !text.includes('{'))
    .map(([code, text]) => [text, code]),
);

/** Catalog code whose English text is exactly `message`, or null. */
export function codeForMessage(message) {
  return typeof message === 'string' ? (messageCodes.get(message) ?? null) : null;
}

/** Resolve an errors.* or validation.* catalog key; otherwise return fallback. */
export function apiMessage(locale, key, fallback = '') {
  if (typeof key !== 'string' || !key) return fallback || '';
  return lookup(locale, 'errors', key) || lookup(locale, 'validation', key) || fallback || key;
}

/**
 * Translates a catalogue service's name/description for non-English locales using serviceCatalog.<id>.
 * A field is translated only while the database text still equals the catalog's English source text,
 * so a name edited by staff is never paired with a stale translation (it stays in the database language).
 */
export function localizeService(locale, service) {
  if (!service || !isUiLocale(locale) || locale === defaultLocale) return service;
  const source = catalogs[defaultLocale].serviceCatalog?.[service.id];
  const target = catalogs[locale]?.serviceCatalog?.[service.id];
  if (!source || !target) return service;
  const pick = (field) =>
    typeof target[field] === 'string' && target[field] && source[field] === service[field]
      ? target[field]
      : service[field];
  return { ...service, name: pick('name'), description: pick('description') };
}

export function localizeFields(locale, fields) {
  if (!fields || typeof fields !== 'object') return fields;
  const out = {};
  for (const [name, value] of Object.entries(fields)) {
    if (typeof value !== 'string') {
      out[name] = value;
      continue;
    }
    const key = hasApiMessage(value) ? value : codeForMessage(value);
    out[name] = key ? apiMessage(locale, key, value) : value;
  }
  return out;
}
