import bcrypt from 'bcrypt';
import type { PasswordHasherPort } from '@application/ports/password-hasher.port.js';

export interface BcryptPasswordHasherConfig {
  readonly rounds: number;
}

export class BcryptPasswordHasher implements PasswordHasherPort {
  constructor(private readonly config: BcryptPasswordHasherConfig) {}

  async hash(plainTextPassword: string): Promise<string> {
    return bcrypt.hash(plainTextPassword, this.config.rounds);
  }

  async compare(plainTextPassword: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(plainTextPassword, passwordHash);
  }
}
