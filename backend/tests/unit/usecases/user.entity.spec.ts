import { describe, expect, it } from '@jest/globals';
import { User } from '@domain/entities/user.entity.js';
import { Email } from '@domain/value-objects/email.vo.js';
import { PasswordHash } from '@domain/value-objects/password-hash.vo.js';
import { UserId } from '@domain/value-objects/user-id.vo.js';

const fakeHash = (): PasswordHash => PasswordHash.create('$2b$12$' + '0'.repeat(53));

describe('User (domain entity)', () => {
  const t0 = new Date('2020-01-01T00:00:00.000Z');
  const clock = (): Date => t0;

  it('registers with normalized email', () => {
    // Act
    const user = User.register({
      id: UserId.create('u1'),
      email: Email.create('  Test@Example.COM  '),
      passwordHash: fakeHash(),
      clock,
    });

    // Assert
    expect(user.email.value).toBe('test@example.com');
  });

  it('updates email and updatedAt', () => {
    // Arrange
    const user = User.register({
      id: UserId.create('u1'),
      email: Email.create('a@b.co'),
      passwordHash: fakeHash(),
      clock,
    });
    const t1 = new Date('2020-02-01T00:00:00.000Z');

    // Act
    user.changeEmail(Email.create('new@b.co'), () => t1);

    // Assert
    expect(user.email.value).toBe('new@b.co');
    expect(user.updatedAt.toISOString()).toBe(t1.toISOString());
  });
});
