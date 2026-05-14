import axios from 'axios';
import { isApiErrorEnvelope } from '@/types/api.types';

export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(error)) {
    const data: unknown = error.response?.data;
    if (isApiErrorEnvelope(data)) {
      return data.error.message;
    }
    if (typeof data === 'object' && data !== null && 'message' in data) {
      const msg = data.message;
      if (typeof msg === 'string') {
        return msg;
      }
    }
    if (error.message.length > 0) {
      return error.message;
    }
  }
  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }
  return fallback;
}
