import type { AxiosResponse } from 'axios';
import type { ApiSuccessEnvelope } from '@/types/api.types';
import { InvalidApiEnvelopeError } from '@/services/http/api-response.error';

export function assertSuccessEnvelope(response: AxiosResponse<unknown>): asserts response is AxiosResponse<
  ApiSuccessEnvelope<unknown>
> {
  const body = response.data;
  if (typeof body !== 'object' || body === null) {
    throw new InvalidApiEnvelopeError();
  }
  if (!('success' in body) || body.success !== true) {
    throw new InvalidApiEnvelopeError();
  }
}

export function readSuccessData(response: AxiosResponse<unknown>): unknown {
  assertSuccessEnvelope(response);
  return response.data.data;
}

export function readSuccessDataWithMeta(response: AxiosResponse<unknown>): {
  readonly data: unknown;
  readonly meta: unknown;
} {
  assertSuccessEnvelope(response);
  return {
    data: response.data.data,
    meta: response.data.metadata,
  };
}
