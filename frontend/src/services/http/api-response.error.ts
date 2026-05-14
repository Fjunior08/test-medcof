/** Resposta inesperada (não envelope `success: true` do backend). */
export class InvalidApiEnvelopeError extends Error {
  constructor(message = 'Invalid API response envelope') {
    super(message);
    this.name = 'InvalidApiEnvelopeError';
  }
}
