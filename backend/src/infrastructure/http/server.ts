import type { Express } from 'express';
import { createServer as createHttpServer, type Server } from 'node:http';

export function startHttpServer(app: Express, port: number): Server {
  const server = createHttpServer(app);
  server.listen(port, () => {
    console.log(`HTTP server listening on port ${String(port)}`);
  });
  return server;
}
