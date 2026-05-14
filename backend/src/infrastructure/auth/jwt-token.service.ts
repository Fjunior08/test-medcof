import type { SignOptions, VerifyOptions } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';
import type {
  JwtAccessTokenClaims,
  JwtSignResult,
  JwtTokenServicePort,
} from '@application/ports/jwt-token-service.port.js';
import { UnauthorizedError } from '@shared/errors/unauthorized.error.js';

export interface JwtTokenServiceConfig {
  readonly secret: string;
  readonly expiresInSeconds: number;
  readonly issuer?: string | undefined;
  readonly audience?: string | undefined;
}

export class JwtTokenService implements JwtTokenServicePort {
  constructor(private readonly config: JwtTokenServiceConfig) {}

  signAccessToken(claims: JwtAccessTokenClaims): Promise<JwtSignResult> {
    const signOptions: SignOptions = {
      subject: claims.sub,
      expiresIn: this.config.expiresInSeconds,
      algorithm: 'HS256',
    };
    if (this.config.issuer !== undefined) {
      signOptions.issuer = this.config.issuer;
    }
    if (this.config.audience !== undefined) {
      signOptions.audience = this.config.audience;
    }

    const token = jwt.sign({ email: claims.email }, this.config.secret, signOptions);

    return Promise.resolve({
      token,
      expiresInSeconds: this.config.expiresInSeconds,
    });
  }

  verifyAccessToken(token: string): Promise<JwtAccessTokenClaims> {
    try {
      const verifyOptions: VerifyOptions = {
        algorithms: ['HS256'],
      };
      if (this.config.issuer !== undefined) {
        verifyOptions.issuer = this.config.issuer;
      }
      if (this.config.audience !== undefined) {
        verifyOptions.audience = this.config.audience;
      }

      const verified = jwt.verify(token, this.config.secret, verifyOptions);

      if (typeof verified === 'string') {
        throw new UnauthorizedError('Invalid token payload');
      }

      const payload = verified as jwt.JwtPayload & { email?: unknown };
      const sub = payload.sub;
      const email = payload.email;

      if (typeof sub !== 'string' || sub.length === 0) {
        throw new UnauthorizedError('Invalid token subject');
      }
      if (typeof email !== 'string' || email.length === 0) {
        throw new UnauthorizedError('Invalid token claims');
      }

      return Promise.resolve({ sub, email });
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      throw new UnauthorizedError('Invalid or expired token');
    }
  }
}
