import { describe, expect, it } from '@jest/globals';
import { User as UserEntity } from '@domain/entities/user.entity.js';
import { Email } from '@domain/value-objects/email.vo.js';
import { PasswordHash } from '@domain/value-objects/password-hash.vo.js';
import { UserId } from '@domain/value-objects/user-id.vo.js';
import { LoginUserUseCase } from '@application/use-cases/login-user.use-case.js';
import { InvalidCredentialsError } from '@shared/errors/invalid-credentials.error.js';
import { createJwtTokenServiceMock } from '../factories/jwt-token-service.mock.js';
import { createPasswordHasherMock } from '../factories/password-hasher.mock.js';
import { createUserRepositoryMock } from '../factories/user-repository.mock.js';

const stableBcryptLikeHash = (): string => '$2b$12$' + 'a'.repeat(22) + 'b'.repeat(31);

describe('LoginUserUseCase', () => {
  const user = UserEntity.reconstitute({
    id: UserId.create('user-1'),
    email: Email.create('login@example.com'),
    passwordHash: PasswordHash.create(stableBcryptLikeHash()),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  it('issues a token when credentials match', async () => {
    // Arrange
    const users = createUserRepositoryMock();
    const hasher = createPasswordHasherMock();
    const tokens = createJwtTokenServiceMock();
    users.findByEmail.mockResolvedValue(user);
    hasher.compare.mockResolvedValue(true);
    tokens.signAccessToken.mockResolvedValue({ token: 'jwt-token', expiresInSeconds: 3600 });
    const useCase = new LoginUserUseCase(users, hasher, tokens);

    // Act
    const result = await useCase.execute({ email: 'login@example.com', password: 'secret12' });

    // Assert
    expect(hasher.compare).toHaveBeenCalledWith('secret12', user.passwordHash.value);
    expect(tokens.signAccessToken).toHaveBeenCalledWith({
      sub: user.id.value,
      email: user.email.value,
    });
    expect(result.accessToken).toBe('jwt-token');
    expect('password' in result).toBe(false);
  });

  it('throws InvalidCredentialsError when user is unknown', async () => {
    // Arrange
    const users = createUserRepositoryMock();
    users.findByEmail.mockResolvedValue(null);
    const useCase = new LoginUserUseCase(users, createPasswordHasherMock(), createJwtTokenServiceMock());

    // Act + Assert
    await expect(useCase.execute({ email: 'login@example.com', password: 'secret12' })).rejects.toBeInstanceOf(
      InvalidCredentialsError,
    );
  });

  it('throws InvalidCredentialsError when password does not match', async () => {
    // Arrange
    const users = createUserRepositoryMock();
    const hasher = createPasswordHasherMock();
    users.findByEmail.mockResolvedValue(user);
    hasher.compare.mockResolvedValue(false);
    const useCase = new LoginUserUseCase(users, hasher, createJwtTokenServiceMock());

    // Act + Assert
    await expect(useCase.execute({ email: 'login@example.com', password: 'wrong-pass' })).rejects.toBeInstanceOf(
      InvalidCredentialsError,
    );
    expect(hasher.compare).toHaveBeenCalled();
  });
});
