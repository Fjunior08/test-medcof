export interface JwtAccessTokenClaims {
  readonly sub: string;
  readonly email: string;
}

export interface JwtSignResult {
  readonly token: string;
  readonly expiresInSeconds: number;
}

export interface JwtTokenServicePort {
  signAccessToken(claims: JwtAccessTokenClaims): Promise<JwtSignResult>;
  verifyAccessToken(token: string): Promise<JwtAccessTokenClaims>;
}
