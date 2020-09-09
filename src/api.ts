import { multinetApi } from 'multinet';
import { host } from '@/environment';
import { getLoginToken, deleteLoginToken } from '@/utils/localStorage';

const storedLoginToken = getLoginToken();
const api = multinetApi(`${host}/api`, storedLoginToken);

export function logout() {
  api.logout();
  deleteLoginToken();
}

export default api;
