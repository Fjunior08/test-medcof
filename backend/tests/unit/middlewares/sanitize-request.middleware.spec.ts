import { describe, expect, it } from '@jest/globals';
import { sanitizeParsedJsonBody } from '@infrastructure/http/middlewares/sanitize-request.middleware.js';

describe('sanitizeParsedJsonBody', () => {
  it('strips prototype pollution keys recursively', () => {
    const input = {
      ok: true,
      nested: { __proto__: { polluted: true }, keep: 1 },
    };
    const out = sanitizeParsedJsonBody(input) as Record<string, unknown>;
    expect(out['ok']).toBe(true);
    const nested = out['nested'] as Record<string, unknown>;
    expect(nested['keep']).toBe(1);
    expect(Object.prototype.hasOwnProperty.call(nested, '__proto__')).toBe(false);
  });

  it('preserves primitives and arrays', () => {
    expect(sanitizeParsedJsonBody(null)).toBeNull();
    expect(sanitizeParsedJsonBody([1, { constructor: 'x' }, 3])).toEqual([1, {}, 3]);
  });

  it('preserves Date values (JSON does not produce them by default, but other parsers might)', () => {
    const d = new Date('2024-06-01T12:00:00.000Z');
    const out = sanitizeParsedJsonBody({ at: d }) as Record<string, unknown>;
    expect(out['at']).toBeInstanceOf(Date);
    expect((out['at'] as Date).toISOString()).toBe(d.toISOString());
  });
});
