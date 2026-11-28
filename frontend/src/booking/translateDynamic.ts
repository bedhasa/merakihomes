type Translator = {
  (key: never, values?: Record<string, string | number>): string;
  has: (key: never) => boolean;
};

/**
 * Translate a key that is only known at runtime (e.g. `status.${value}`).
 * Returns `fallback` when the catalog has no such key, so unexpected server values never throw.
 */
export function translateDynamic(
  t: Translator,
  key: string,
  fallback: string,
  values?: Record<string, string | number>,
): string {
  return t.has(key as never) ? t(key as never, values) : fallback;
}
