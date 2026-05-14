import pino from 'pino';
import type { LoggerPort, LogContext } from '@shared/logging/logger.port.js';
import { appConfig, Environment } from '@shared/config/index.js';

function toPinoBindings(bindings: LogContext): Record<string, unknown> {
  return { ...bindings };
}

export class PinoLoggerAdapter implements LoggerPort {
  constructor(private readonly log: pino.Logger) {}

  debug(message: string, context?: LogContext): void {
    if (context === undefined) {
      this.log.debug(message);
    } else {
      this.log.debug(context, message);
    }
  }

  info(message: string, context?: LogContext): void {
    if (context === undefined) {
      this.log.info(message);
    } else {
      this.log.info(context, message);
    }
  }

  warn(message: string, context?: LogContext): void {
    if (context === undefined) {
      this.log.warn(message);
    } else {
      this.log.warn(context, message);
    }
  }

  error(message: string, context?: LogContext): void {
    if (context === undefined) {
      this.log.error(message);
    } else {
      this.log.error(context, message);
    }
  }

  child(bindings: LogContext): LoggerPort {
    return new PinoLoggerAdapter(this.log.child(toPinoBindings(bindings)));
  }
}

export function createPinoAppLogger(): LoggerPort {
  const isProd = Environment.isProduction(appConfig.nodeEnv);
  const usePretty = Environment.isDevelopment(appConfig.nodeEnv);
  const root = pino({
    level: isProd ? 'info' : 'debug',
    base: { service: 'medcof-api', env: appConfig.nodeEnv },
    redact: {
      paths: ['req.headers.authorization', 'authorization', '*.password', '*.accessToken', '*.token'],
      remove: true,
    },
    ...(usePretty
      ? {
          transport: {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'SYS:standard',
              ignore: 'pid,hostname',
            },
          },
        }
      : {}),
  });
  return new PinoLoggerAdapter(root);
}
