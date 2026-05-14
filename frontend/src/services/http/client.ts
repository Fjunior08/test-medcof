import axios, { type AxiosInstance } from 'axios';
import { getAccessToken } from '@/services/http/auth-token';

let instance: AxiosInstance | null = null;

export function getHttpClient(): AxiosInstance {
  if (instance !== null) {
    return instance;
  }
  instance = axios.create({
    baseURL: '/api',
    headers: {
      'Content-Type': 'application/json',
    },
    validateStatus: (status) => status >= 200 && status < 300,
  });

  instance.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token !== null && token.length > 0) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  });

  return instance;
}
