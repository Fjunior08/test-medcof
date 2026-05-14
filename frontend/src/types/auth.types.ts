export interface AuthUser {
  readonly id: string;
  readonly email: string;
}

export interface LoginCredentials {
  readonly email: string;
  readonly password: string;
}

export interface RegisterCredentials {
  readonly email: string;
  readonly password: string;
}

/** Corpo `data` em POST /auth/login */
export interface LoginSuccessData {
  readonly accessToken: string;
  readonly tokenType: string;
  readonly expiresIn: number;
  readonly user: AuthUser;
}

/** Corpo `data` em POST /auth/register */
export interface RegisterSuccessData {
  readonly user: {
    readonly id: string;
    readonly email: string;
    readonly createdAt: string;
  };
}

/** Corpo `data` em GET /auth/me */
export interface MeSuccessData {
  readonly user: AuthUser;
}
