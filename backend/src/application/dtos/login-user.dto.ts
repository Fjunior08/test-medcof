export interface LoginUserCommand {
  readonly email: string;
  readonly password: string;
}

export interface LoginUserResult {
  readonly accessToken: string;
  readonly tokenType: 'Bearer';
  readonly expiresIn: number;
  readonly user: {
    readonly id: string;
    readonly email: string;
  };
}
