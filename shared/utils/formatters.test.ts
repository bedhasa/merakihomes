import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { formatETBOnly, formatMoney, formatNumber } from './formatters.ts';

describe('locale-aware money formatting', () => {
  it('formats ETB for English without hard-coding en-US', () => {
    const en = formatETBOnly(1500, 'en');
    assert.match(en, /1[,.]?500/);
    assert.match(en, /ETB|ብር/);
  });

  it('formats ETB for Amharic with birr label', () => {
    const am = formatETBOnly(1500, 'am');
    assert.match(am, /1[,.]?500/);
    assert.match(am, /ብር/);
  });

  it('formatMoney matches formatETBOnly for ETB', () => {
    assert.equal(formatMoney(2400, 'ETB', 'am'), formatETBOnly(2400, 'am'));
  });

  it('formatNumber uses locale grouping', () => {
    assert.match(formatNumber(12000, 'en'), /12[,.]?000/);
    assert.match(formatNumber(12000, 'am'), /12[,.]?000/);
  });
});
