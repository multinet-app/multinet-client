const localStorageLoginTokenKey = 'loginToken';

export function getLoginToken(): string | null {
  return localStorage.getItem(localStorageLoginTokenKey);
}

export function saveLoginToken(token: string) {
  localStorage.setItem(localStorageLoginTokenKey, token);
}

export function deleteLoginToken() {
  localStorage.removeItem(localStorageLoginTokenKey);
}
