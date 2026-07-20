/**
 * Pluggable auth-token source for httpClient. Left as a no-op until a real
 * auth flow (e.g. OAuth 2.0) is wired in — httpClient calls `getAuthToken()`
 * before every request and, if it resolves a token, sends it as a Bearer
 * `Authorization` header. Nothing calls `setAuthTokenProvider` yet, so
 * request behavior is unchanged today.
 */
export type AuthTokenProvider = () => string | null | Promise<string | null>;

let provider: AuthTokenProvider = () => null;

export function setAuthTokenProvider(next: AuthTokenProvider): void {
  provider = next;
}

export async function getAuthToken(): Promise<string | null> {
  return provider();
}
