import { multinetApi } from 'multinet';
import { host } from '@/environment';
import { UserInfo } from '@/types';

const api = multinetApi(`${host}/api`);

export async function getUserInfo(): Promise<UserInfo | null> {
  const resp = await fetch(`${host}/user/info`, {
    credentials: 'include',
  });

  if (resp.ok) {
    return resp.json();
  }

  return null;
}

export default api;
