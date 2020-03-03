import { multinetApi } from 'multinet';
import { host } from '@/environment';

const api = multinetApi(`${host}/api`);

export default api;
