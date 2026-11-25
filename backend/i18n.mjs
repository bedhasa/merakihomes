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

/** Resolve an errors.* or validation.* catalog key; otherwise return fallback. */
export function apiMessage(locale, key, fallback = '') {
  if (typeof key !== 'string' || !key) return fallback || '';
  return lookup(locale, 'errors', key) || lookup(locale, 'validation', key) || fallback || key;
}

export function localizeFields(locale, fields) {
  if (!fields || typeof fields !== 'object') return fields;
  const out = {};
  for (const [name, value] of Object.entries(fields)) {
    out[name] = typeof value === 'string' ? apiMessage(locale, value, value) : value;
  }
  return out;
}
