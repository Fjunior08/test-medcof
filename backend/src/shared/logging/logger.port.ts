/**
 * Abstração de logging: infraestrutura e middlewares dependem disto, não de Pino/Winston.
 */
export type LogContext = Readonly<Record<string, unknown>>;

export interface LoggerPort {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
  child(bindings: LogContext): LoggerPort;
}
