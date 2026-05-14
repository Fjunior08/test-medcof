import type { Email } from '../value-objects/email.vo.js';
import type { PasswordHash } from '../value-objects/password-hash.vo.js';
import type { UserId } from '../value-objects/user-id.vo.js';

function cloneDate(date: Date): Date {
  return new Date(date.getTime());
}

interface UserInternal {
  id: UserId;
  email: Email;
  passwordHash: PasswordHash;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private constructor(private internal: UserInternal) {}

  static register(input: {
    id: UserId;
    email: Email;
    passwordHash: PasswordHash;
    clock?: () => Date;
  }): User {
    const now = cloneDate(input.clock?.() ?? new Date());
    return new User({
      id: input.id,
      email: input.email,
      passwordHash: input.passwordHash,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: {
    id: UserId;
    email: Email;
    passwordHash: PasswordHash;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return new User({
      id: props.id,
      email: props.email,
      passwordHash: props.passwordHash,
      createdAt: cloneDate(props.createdAt),
      updatedAt: cloneDate(props.updatedAt),
    });
  }

  get id(): UserId {
    return this.internal.id;
  }

  get email(): Email {
    return this.internal.email;
  }

  get passwordHash(): PasswordHash {
    return this.internal.passwordHash;
  }

  get createdAt(): Date {
    return cloneDate(this.internal.createdAt);
  }

  get updatedAt(): Date {
    return cloneDate(this.internal.updatedAt);
  }

  changeEmail(email: Email, clock?: () => Date): void {
    if (this.internal.email.equals(email)) {
      return;
    }
    this.internal.email = email;
    this.internal.updatedAt = cloneDate(clock?.() ?? new Date());
  }

  changePasswordHash(passwordHash: PasswordHash, clock?: () => Date): void {
    this.internal.passwordHash = passwordHash;
    this.internal.updatedAt = cloneDate(clock?.() ?? new Date());
  }
}
