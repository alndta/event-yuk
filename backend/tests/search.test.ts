import { describe, expect, it } from 'vitest';
import { matchesQuery, normalize } from '../src/shared/search';

describe('search matching', () => {
  it('ignores case, accents and extra spaces', () => {
    expect(normalize('  Jakarta   Pusat ')).toBe('jakarta pusat');
    expect(matchesQuery('JAKARTA', ['Gelora Bung Karno, Jakarta'])).toBe(true);
  });
  it('needs every word to match', () => {
    expect(matchesQuery('musik bandung', ['Festival Musik', 'Jakarta'])).toBe(false);
    expect(matchesQuery('musik jakarta', ['Festival Musik', 'Jakarta'])).toBe(true);
  });
  it('empty query matches all', () => {
    expect(matchesQuery(undefined, ['x'])).toBe(true);
  });
});
