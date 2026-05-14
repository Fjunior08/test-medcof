import type { Request, Response } from 'express';
import type { RegisterUserUseCase } from '@application/use-cases/register-user.use-case.js';
import type { LoginUserUseCase } from '@application/use-cases/login-user.use-case.js';
import { ApiResponse } from '@shared/http/api-response.js';
import { loginBodySchema, registerBodySchema } from '../schemas/auth.schema.js';

export class AuthController {
  constructor(
    private readonly registerUser: RegisterUserUseCase,
    private readonly loginUser: LoginUserUseCase,
  ) {}

  register = async (req: Request, res: Response): Promise<void> => {
    const body = registerBodySchema.parse(req.body);
    const result = await this.registerUser.execute({
      email: body.email,
      password: body.password,
    });
    ApiResponse.success(res, 201, { user: result });
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const body = loginBodySchema.parse(req.body);
    const result = await this.loginUser.execute({
      email: body.email,
      password: body.password,
    });
    ApiResponse.success(res, 200, result);
  };
}
