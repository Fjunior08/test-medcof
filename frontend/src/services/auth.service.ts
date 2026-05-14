import { getHttpClient } from '@/services/http/client';
import { readSuccessData } from '@/services/http/parse-response';
import type { AuthUser, LoginCredentials, LoginSuccessData, MeSuccessData, RegisterCredentials, RegisterSuccessData } from '@/types/auth.types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginSuccessData> {
    const client = getHttpClient();
    const res = await client.post<unknown>('/auth/login', credentials);
    return readSuccessData(res) as LoginSuccessData;
  },

  async register(credentials: RegisterCredentials): Promise<RegisterSuccessData['user']> {
    const client = getHttpClient();
    const res = await client.post<unknown>('/auth/register', credentials);
    const body = readSuccessData(res) as RegisterSuccessData;
    return body.user;
  },

  async fetchMe(): Promise<AuthUser> {
    const client = getHttpClient();
    const res = await client.get<unknown>('/auth/me');
    const body = readSuccessData(res) as MeSuccessData;
    return body.user;
  },
} as const;
