import { multinetApi } from 'multinet';
import { host } from '@/environment';
import { getLoginToken, deleteLoginToken } from '@/utils/localStorage';

const api = multinetApi(`${host}/api`, getLoginToken());

export function logout() {
  api.logout();
  deleteLoginToken();
}

export default api;
