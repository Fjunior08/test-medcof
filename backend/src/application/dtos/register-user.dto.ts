export interface RegisterUserCommand {
  readonly email: string;
  readonly password: string;
}

export interface RegisterUserResult {
  readonly id: string;
  readonly email: string;
  readonly createdAt: string;
}
