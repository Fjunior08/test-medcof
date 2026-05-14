import { describe, expect, it } from '@jest/globals';
import { InvalidEmailError } from '@domain/errors/invalid-email.error.js';
import { Email } from '@domain/value-objects/email.vo.js';

describe('Email (value object)', () => {
  it('rejects invalid addresses', () => {
    // Act + Assert
    expect(() => {
      Email.create('');
    }).toThrow(InvalidEmailError);
    expect(() => {
      Email.create('not-an-email');
    }).toThrow(InvalidEmailError);
  });
});
