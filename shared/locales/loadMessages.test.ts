import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getMessages, loadMessages, messagesByLocale, uiLocales } from './index.ts';

describe('shared locale JSON resolution', () => {
  it('exposes static catalogs for every UI locale', () => {
    for (const locale of uiLocales) {
      assert.ok(messagesByLocale[locale].common.brand);
      assert.ok(messagesByLocale[locale].nav.home);
    }
  });

  it('loads messages synchronously and via dynamic import', async () => {
    const syncEn = getMessages('en');
    const syncAm = getMessages('am');
    const dynEn = await loadMessages('en');
    const dynAm = await loadMessages('am');

    assert.equal(syncEn.meta.homeTitle, dynEn.meta.homeTitle);
    assert.equal(syncAm.auth.submitButton, dynAm.auth.submitButton);
    assert.notEqual(syncEn.nav.home, syncAm.nav.home);
  });

  it('falls back to English for unknown locales', async () => {
    const messages = await loadMessages('fr');
    assert.equal(messages.common.brand, getMessages('en').common.brand);
  });
});
