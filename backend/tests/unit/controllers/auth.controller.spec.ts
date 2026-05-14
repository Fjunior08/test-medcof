import { describe, expect, it, jest } from '@jest/globals';
import { ZodError } from 'zod';
import type { LoginUserUseCase } from '@application/use-cases/login-user.use-case.js';
import type { RegisterUserUseCase } from '@application/use-cases/register-user.use-case.js';
import { AuthController } from '@infrastructure/http/controllers/auth.controller.js';
import { createMockResponse, createRequest } from '../factories/http.js';

describe('AuthController', () => {
  const makeController = (registerUser: RegisterUserUseCase, loginUser: LoginUserUseCase) =>
    new AuthController(registerUser, loginUser);

  it('registers user and returns 201 JSON payload', async () => {
    const registerUser = { execute: jest.fn(async () => ({ id: 'u1', email: 'a@b.co', createdAt: 't' })) };
    const loginUser = { execute: jest.fn() };
    const controller = makeController(
      registerUser as unknown as RegisterUserUseCase,
      loginUser as unknown as LoginUserUseCase,
    );
    const { res, status, json } = createMockResponse();
    const req = createRequest({
      body: { email: 'a@b.co', password: 'password1' },
    });

    await controller.register(req, res);

    expect(registerUser.execute).toHaveBeenCalledWith({ email: 'a@b.co', password: 'password1' });
    expect(status).toHaveBeenCalledWith(201);
    expect(json).toHaveBeenCalledWith({
      success: true,
      data: { user: { id: 'u1', email: 'a@b.co', createdAt: 't' } },
    });
  });

  it('rejects with ZodError on invalid register payload', async () => {
    const registerUser = { execute: jest.fn() };
    const loginUser = { execute: jest.fn() };
    const controller = makeController(
      registerUser as unknown as RegisterUserUseCase,
      loginUser as unknown as LoginUserUseCase,
    );
    const { res, status } = createMockResponse();
    const req = createRequest({ body: { email: 'bad', password: 'short' } });

    await expect(controller.register(req, res)).rejects.toBeInstanceOf(ZodError);
    expect(status).not.toHaveBeenCalled();
    expect(registerUser.execute).not.toHaveBeenCalled();
  });

  it('logs in and returns 200 JSON payload', async () => {
    const payload = {
      accessToken: 'tok',
      tokenType: 'Bearer' as const,
      expiresIn: 3600,
      user: { id: 'u1', email: 'a@b.co' },
    };
    const registerUser = { execute: jest.fn() };
    const loginUser = { execute: jest.fn(async () => payload) };
    const controller = makeController(
      registerUser as unknown as RegisterUserUseCase,
      loginUser as unknown as LoginUserUseCase,
    );
    const { res, status, json } = createMockResponse();
    const req = createRequest({ body: { email: 'a@b.co', password: 'password1' } });

    await controller.login(req, res);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ success: true, data: payload });
  });
});
