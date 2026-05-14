import { User } from '@domain/entities/user.entity.js';
import { Email } from '@domain/value-objects/email.vo.js';
import { PasswordHash } from '@domain/value-objects/password-hash.vo.js';
import { UserId } from '@domain/value-objects/user-id.vo.js';

export interface UserRowRecord {
  readonly id: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export function mapUserRowToAggregate(row: UserRowRecord): User {
  return User.reconstitute({
    id: UserId.create(row.id),
    email: Email.create(row.email),
    passwordHash: PasswordHash.create(row.passwordHash),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export function mapUserAggregateToCreateFields(user: User): {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
} {
  return {
    id: user.id.value,
    email: user.email.value,
    passwordHash: user.passwordHash.value,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function mapUserAggregateToUpdateFields(user: User): {
  email: string;
  passwordHash: string;
  updatedAt: Date;
} {
  return {
    email: user.email.value,
    passwordHash: user.passwordHash.value,
    updatedAt: user.updatedAt,
  };
}
