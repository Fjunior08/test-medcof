/**
 * Sonda de disponibilidade da persistência (readiness / depuração).
 */
export interface DatabaseHealthPort {
  readonly ping: () => Promise<void>;
}
