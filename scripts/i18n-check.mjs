/**
 * Fails when en/am catalogs diverge, Amharic values are empty, ICU fails to parse,
 * or ICU argument / plural structure differs between locales.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from '@formatjs/icu-messageformat-parser';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const localesDir = join(root, 'shared', 'locales');
const localeIds = ['en', 'am'];

const TYPE = {
  literal: 0,
  argument: 1,
  number: 2,
  date: 3,
  time: 4,
  select: 5,
  plural: 6,
  pound: 7,
  tag: 8,
};

function loadLocale(id) {
  return JSON.parse(readFileSync(join(localesDir, `${id}.json`), 'utf8'));
}

function flatten(node, prefix = '', out = new Map()) {
  if (node === null || node === undefined) {
    out.set(prefix, node);
    return out;
  }
  if (typeof node !== 'object' || Array.isArray(node)) {
    out.set(prefix, node);
    return out;
  }
  for (const [key, value] of Object.entries(node)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) flatten(value, path, out);
    else out.set(path, value);
  }
  return out;
}

function walkAst(elements, visit) {
  for (const el of elements) {
    visit(el);
    if (el.type === TYPE.plural || el.type === TYPE.select) {
      for (const option of Object.values(el.options || {})) walkAst(option.value || [], visit);
    } else if (el.type === TYPE.tag) {
      walkAst(el.children || [], visit);
    }
  }
}

function icuSignature(message) {
  const ast = parse(message, { ignoreTag: false, requiresOtherClause: true });
  const args = new Set();
  const plurals = [];

  walkAst(ast, (el) => {
    if (
      el.type === TYPE.argument ||
      el.type === TYPE.number ||
      el.type === TYPE.date ||
      el.type === TYPE.time ||
      el.type === TYPE.plural ||
      el.type === TYPE.select
    ) {
      args.add(el.value);
    }
    if (el.type === TYPE.plural || el.type === TYPE.select) {
      plurals.push({
        name: el.value,
        kind: el.type === TYPE.plural ? 'plural' : 'select',
        options: Object.keys(el.options || {}).sort(),
        offset: el.type === TYPE.plural ? el.offset || 0 : undefined,
      });
    }
  });

  return {
    args: [...args].sort(),
    plurals: plurals.sort((a, b) => a.name.localeCompare(b.name) || a.kind.localeCompare(b.kind)),
  };
}

function sameSignature(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

const catalogs = Object.fromEntries(localeIds.map((id) => [id, flatten(loadLocale(id))]));
const enKeys = [...catalogs.en.keys()].sort();
const amKeys = [...catalogs.am.keys()].sort();
const errors = [];

const missingInAm = enKeys.filter((key) => !catalogs.am.has(key));
const extraInAm = amKeys.filter((key) => !catalogs.en.has(key));
if (missingInAm.length) errors.push(`Keys missing in am.json:\n  - ${missingInAm.join('\n  - ')}`);
if (extraInAm.length)
  errors.push(`Keys present in am.json but not en.json:\n  - ${extraInAm.join('\n  - ')}`);

for (const key of enKeys) {
  if (!catalogs.am.has(key)) continue;
  const enValue = catalogs.en.get(key);
  const amValue = catalogs.am.get(key);

  if (typeof enValue !== 'string' || typeof amValue !== 'string') {
    errors.push(`${key}: values must be strings (en=${typeof enValue}, am=${typeof amValue})`);
    continue;
  }
  if (!amValue.trim()) errors.push(`${key}: am value is empty`);

  let enSig;
  let amSig;
  try {
    enSig = icuSignature(enValue);
  } catch (error) {
    errors.push(`${key}: en ICU parse failed: ${error.message}`);
  }
  try {
    amSig = icuSignature(amValue);
  } catch (error) {
    errors.push(`${key}: am ICU parse failed: ${error.message}`);
  }
  if (enSig && amSig && !sameSignature(enSig, amSig)) {
    errors.push(
      `${key}: ICU structure differs\n  en=${JSON.stringify(enSig)}\n  am=${JSON.stringify(amSig)}`,
    );
  }
}

if (errors.length) {
  console.error(`i18n:check failed with ${errors.length} issue(s):\n\n${errors.join('\n\n')}`);
  process.exit(1);
}

console.log(`i18n:check passed (${enKeys.length} keys, locales: ${localeIds.join(', ')})`);
