import { multinetApi } from 'multinet';
import { host } from '@/environment';
import { UserInfo } from '@/types';

const api = multinetApi(`${host}/api`);

export async function getUserInfo(): Promise<UserInfo | null> {
  const resp = await fetch(`${host}/api/user/info`, {
    credentials: 'include',
  });

  if (resp.ok) {
    return resp.json();
  }

  return null;
}

export function logout() {
  return fetch(`${host}/api/user/logout`);
}

export default api;
