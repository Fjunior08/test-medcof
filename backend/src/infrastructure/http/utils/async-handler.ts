import type { Request, RequestHandler, Response } from 'express';

/**
 * Encaminha rejeições ao `next` para o error middleware.
 * Aceita handler síncrono ou async (sem `return Promise.resolve()` artificial).
 */
export function asyncHandler(fn: (req: Request, res: Response) => void | Promise<void>): RequestHandler {
  return (req, res, next) => {
    void Promise.resolve(fn(req, res)).catch(next);
  };
}
