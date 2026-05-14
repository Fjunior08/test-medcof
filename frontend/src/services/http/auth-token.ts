let resolveAccessToken: () => string | null = () => null;

export function registerAccessTokenResolver(getter: () => string | null): void {
  resolveAccessToken = getter;
}

export function getAccessToken(): string | null {
  return resolveAccessToken();
}
