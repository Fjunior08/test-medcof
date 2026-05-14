import 'dotenv/config';
import type { Server } from 'node:http';
import { appConfig } from '@shared/config/index.js';
import { createCompositionRoot } from '@composition/composition-root.js';
import { startHttpServer } from '@infrastructure/http/server.js';
import { disconnectPrisma } from '@infrastructure/database/prisma.client.js';

const container = createCompositionRoot();
const app = container.resolve('httpApp');

const server = startHttpServer(app, appConfig.server.port);

async function shutdown(signal: string): Promise<void> {
  console.info(`Received ${signal}, draining HTTP connections…`);
  const httpServer = server as Server & { closeIdleConnections?: () => void };
  if (typeof httpServer.closeIdleConnections === 'function') {
    httpServer.closeIdleConnections();
  }
  await new Promise<void>((resolve, reject) => {
    server.close((err) => {
      if (err !== undefined) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
  await disconnectPrisma();
  process.exit(0);
}

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    void shutdown(signal).catch((err: unknown) => {
      console.error(err);
      process.exit(1);
    });
  });
}
