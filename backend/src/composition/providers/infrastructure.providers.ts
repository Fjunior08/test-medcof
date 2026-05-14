import type { AppContainer } from '../app-container.js';
import { appConfig } from '@shared/config/index.js';
import { createPinoAppLogger } from '@infrastructure/logging/pino-logger.adapter.js';
import { getPrismaClient } from '@infrastructure/database/prisma.client.js';
import { PrismaDatabaseHealth } from '@infrastructure/database/prisma-database-health.service.js';
import { PrismaUserRepository } from '@infrastructure/persistence/prisma-user.repository.js';
import { PrismaTaskRepository } from '@infrastructure/persistence/prisma-task.repository.js';
import { BcryptPasswordHasher } from '@infrastructure/auth/bcrypt-password-hasher.service.js';
import { JwtTokenService } from '@infrastructure/auth/jwt-token.service.js';
import { createAuthenticateMiddleware } from '@infrastructure/http/middlewares/auth.middleware.js';

/**
 * Adaptadores de infraestrutura (DB, auth, HTTP middleware).
 */
export function registerInfrastructureProviders(container: AppContainer): void {
  container.registerSingleton('appLogger', () => createPinoAppLogger());

  const prisma = getPrismaClient(appConfig.nodeEnv);

  container.registerSingleton('databaseHealth', () => new PrismaDatabaseHealth(prisma));

  container.registerSingleton('userRepository', () => new PrismaUserRepository(prisma));

  container.registerSingleton('taskRepository', () => new PrismaTaskRepository(prisma));

  container.registerSingleton(
    'passwordHasher',
    () =>
      new BcryptPasswordHasher({
        rounds: appConfig.auth.bcryptRounds,
      }),
  );

  container.registerSingleton(
    'jwtTokenService',
    () =>
      new JwtTokenService({
        secret: appConfig.auth.jwtSecret,
        expiresInSeconds: appConfig.auth.jwtExpiresInSeconds,
        issuer: appConfig.auth.jwtIssuer,
        audience: appConfig.auth.jwtAudience,
      }),
  );

  container.registerSingleton('authenticateMiddleware', (c) =>
    createAuthenticateMiddleware(c.resolve('jwtTokenService'), c.resolve('appLogger')),
  );
}
