import { describe, expect, it } from '@jest/globals';
import { User as UserEntity } from '@domain/entities/user.entity.js';
import { Email } from '@domain/value-objects/email.vo.js';
import { PasswordHash } from '@domain/value-objects/password-hash.vo.js';
import { UserId } from '@domain/value-objects/user-id.vo.js';
import { RegisterUserUseCase } from '@application/use-cases/register-user.use-case.js';
import { ConflictError } from '@shared/errors/conflict.error.js';
import { createPasswordHasherMock } from '../factories/password-hasher.mock.js';
import { createUserRepositoryMock } from '../factories/user-repository.mock.js';

const stableBcryptLikeHash = (): string => '$2b$12$' + 'a'.repeat(22) + 'b'.repeat(31);

describe('RegisterUserUseCase', () => {
  it('hashes password, tryCreates user, and never returns password material', async () => {
    const users = createUserRepositoryMock();
    const hasher = createPasswordHasherMock();
    const hash = stableBcryptLikeHash();
    users.findByEmail.mockResolvedValue(null);
    hasher.hash.mockResolvedValue(hash);
    users.tryCreate.mockResolvedValue(undefined);
    const useCase = new RegisterUserUseCase(users, hasher);

    const result = await useCase.execute({ email: 'hello@example.com', password: 'password1' });

    expect(hasher.hash).toHaveBeenCalledWith('password1');
    expect(users.tryCreate).toHaveBeenCalledTimes(1);
    expect(users.save).not.toHaveBeenCalled();
    expect(result.email).toBe('hello@example.com');
    expect(result.id.length).toBeGreaterThan(0);
    expect('password' in result).toBe(false);
    expect('passwordHash' in result).toBe(false);
    const created = users.tryCreate.mock.calls[0]?.[0];
    expect(created?.passwordHash.value).toBe(hash);
  });

  it('throws ConflictError when email already exists (fast path)', async () => {
    const users = createUserRepositoryMock();
    const hasher = createPasswordHasherMock();
    const existing = UserEntity.reconstitute({
      id: UserId.create('existing-id'),
      email: Email.create('dup@example.com'),
      passwordHash: PasswordHash.create(stableBcryptLikeHash()),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    users.findByEmail.mockResolvedValue(existing);
    const useCase = new RegisterUserUseCase(users, hasher);

    await expect(useCase.execute({ email: 'dup@example.com', password: 'password1' })).rejects.toBeInstanceOf(
      ConflictError,
    );
    expect(users.tryCreate).not.toHaveBeenCalled();
    expect(hasher.hash).not.toHaveBeenCalled();
  });

  it('throws ConflictError when tryCreate rejects (e.g. unique race)', async () => {
    const users = createUserRepositoryMock();
    const hasher = createPasswordHasherMock();
    users.findByEmail.mockResolvedValue(null);
    hasher.hash.mockResolvedValue(stableBcryptLikeHash());
    users.tryCreate.mockRejectedValue(new ConflictError('An account with this email already exists'));
    const useCase = new RegisterUserUseCase(users, hasher);

    await expect(useCase.execute({ email: 'race@example.com', password: 'password1' })).rejects.toBeInstanceOf(
      ConflictError,
    );
    expect(hasher.hash).toHaveBeenCalled();
    expect(users.tryCreate).toHaveBeenCalledTimes(1);
  });
});
