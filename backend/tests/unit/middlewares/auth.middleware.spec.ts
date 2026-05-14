import { describe, expect, it } from '@jest/globals';
import { createAuthenticateMiddleware } from '@infrastructure/http/middlewares/auth.middleware.js';
import { UnauthorizedError } from '@shared/errors/unauthorized.error.js';
import { bearerAuthorizationHeader } from '../factories/auth.factory.js';
import { createJwtTokenServiceMock } from '../factories/jwt-token-service.mock.js';
import { createLoggerMock } from '../factories/logger.mock.js';
import { createMockNext, createMockResponse, createRequest } from '../factories/http.js';

describe('createAuthenticateMiddleware', () => {
  const logger = createLoggerMock();

  it('rejects missing Authorization with UnauthorizedError', async () => {
    // Arrange
    const tokens = createJwtTokenServiceMock();
    const mw = createAuthenticateMiddleware(tokens, logger);
    const req = createRequest({ headers: {} });
    const next = createMockNext();

    // Act
    await mw(req, createMockResponse().res, next);

    // Assert
    expect(tokens.verifyAccessToken).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it('rejects malformed Bearer header (no token)', async () => {
    // Arrange
    const tokens = createJwtTokenServiceMock();
    const mw = createAuthenticateMiddleware(tokens, logger);
    const req = createRequest({ headers: { authorization: 'Bearer ' } });
    const next = createMockNext();

    // Act
    await mw(req, createMockResponse().res, next);

    // Assert
    expect(tokens.verifyAccessToken).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it('rejects empty token after Bearer prefix', async () => {
    // Arrange
    const tokens = createJwtTokenServiceMock();
    const mw = createAuthenticateMiddleware(tokens, logger);
    const req = createRequest({ headers: { authorization: 'Bearer    ' } });
    const next = createMockNext();

    // Act
    await mw(req, createMockResponse().res, next);

    // Assert
    expect(tokens.verifyAccessToken).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it('attaches user and calls next when token verifies', async () => {
    // Arrange
    const tokens = createJwtTokenServiceMock();
    tokens.verifyAccessToken.mockResolvedValue({ sub: 'u1', email: 'a@b.co' });
    const mw = createAuthenticateMiddleware(tokens, logger);
    const req = createRequest({ headers: bearerAuthorizationHeader('valid.jwt') });
    const next = createMockNext();

    // Act
    await mw(req, createMockResponse().res, next);

    // Assert
    expect(tokens.verifyAccessToken).toHaveBeenCalledWith('valid.jwt');
    expect(req.user).toEqual({ id: 'u1', email: 'a@b.co' });
    expect(next).toHaveBeenCalledWith();
  });

  it('maps verify failures (e.g. expired token) to UnauthorizedError', async () => {
    // Arrange
    const tokens = createJwtTokenServiceMock();
    tokens.verifyAccessToken.mockRejectedValue(new Error('jwt expired'));
    const mw = createAuthenticateMiddleware(tokens, logger);
    const req = createRequest({ headers: bearerAuthorizationHeader('expired') });
    const next = createMockNext();

    // Act
    await mw(req, createMockResponse().res, next);

    // Assert
    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it('preserves UnauthorizedError thrown by token service', async () => {
    // Arrange
    const tokens = createJwtTokenServiceMock();
    const original = new UnauthorizedError('invalid signature');
    tokens.verifyAccessToken.mockRejectedValue(original);
    const mw = createAuthenticateMiddleware(tokens, logger);
    const req = createRequest({ headers: bearerAuthorizationHeader('bad') });
    const next = createMockNext();

    // Act
    await mw(req, createMockResponse().res, next);

    // Assert
    expect(next).toHaveBeenCalledWith(original);
  });
});
