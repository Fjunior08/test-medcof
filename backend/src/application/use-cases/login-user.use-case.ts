import type { UserRepositoryPort } from '@domain/ports/user-repository.port.js';
import { Email } from '@domain/value-objects/email.vo.js';
import type { PasswordHasherPort } from '@application/ports/password-hasher.port.js';
import type { JwtTokenServicePort } from '@application/ports/jwt-token-service.port.js';
import type { LoginUserCommand, LoginUserResult } from '@application/dtos/login-user.dto.js';
import { InvalidCredentialsError } from '@shared/errors/invalid-credentials.error.js';

export class LoginUserUseCase {
  constructor(
    private readonly users: UserRepositoryPort,
    private readonly passwordHasher: PasswordHasherPort,
    private readonly tokens: JwtTokenServicePort,
  ) {}

  async execute(command: LoginUserCommand): Promise<LoginUserResult> {
    const email = Email.create(command.email);
    const user = await this.users.findByEmail(email);

    if (user === null) {
      throw new InvalidCredentialsError();
    }

    const matches = await this.passwordHasher.compare(command.password, user.passwordHash.value);
    if (!matches) {
      throw new InvalidCredentialsError();
    }

    const { token, expiresInSeconds } = await this.tokens.signAccessToken({
      sub: user.id.value,
      email: user.email.value,
    });

    return {
      accessToken: token,
      tokenType: 'Bearer',
      expiresIn: expiresInSeconds,
      user: {
        id: user.id.value,
        email: user.email.value,
      },
    };
  }
}
