import { randomUUID } from 'node:crypto';
import type { UserRepositoryPort } from '@domain/ports/user-repository.port.js';
import { User } from '@domain/entities/user.entity.js';
import { Email } from '@domain/value-objects/email.vo.js';
import { PasswordHash } from '@domain/value-objects/password-hash.vo.js';
import { UserId } from '@domain/value-objects/user-id.vo.js';
import type { PasswordHasherPort } from '@application/ports/password-hasher.port.js';
import type { RegisterUserCommand, RegisterUserResult } from '@application/dtos/register-user.dto.js';
import { ConflictError } from '@shared/errors/conflict.error.js';

export class RegisterUserUseCase {
  constructor(
    private readonly users: UserRepositoryPort,
    private readonly passwordHasher: PasswordHasherPort,
  ) {}

  async execute(command: RegisterUserCommand): Promise<RegisterUserResult> {
    const email = Email.create(command.email);
    const existing = await this.users.findByEmail(email);
    if (existing !== null) {
      throw new ConflictError('An account with this email already exists');
    }

    const hashed = await this.passwordHasher.hash(command.password);
    const passwordHash = PasswordHash.create(hashed);

    const user = User.register({
      id: UserId.create(randomUUID()),
      email,
      passwordHash,
    });

    await this.users.tryCreate(user);

    return {
      id: user.id.value,
      email: user.email.value,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
