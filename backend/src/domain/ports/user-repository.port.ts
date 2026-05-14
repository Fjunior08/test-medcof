import type { User } from '../entities/user.entity.js';
import type { Email } from '../value-objects/email.vo.js';
import type { UserId } from '../value-objects/user-id.vo.js';

export interface UserRepositoryPort {
  save(user: User): Promise<void>;
  /** Insert exclusivo: falha com conflito se o email já existir (seguro em corrida com índice único). */
  tryCreate(user: User): Promise<void>;
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
}
