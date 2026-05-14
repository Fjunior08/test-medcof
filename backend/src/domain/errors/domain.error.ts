/**
 * Base class for domain-only failures (no transport or HTTP semantics).
 * Map to HTTP in the application or infrastructure layer.
 */
export abstract class DomainError extends Error {
  abstract readonly code: string;

  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}
