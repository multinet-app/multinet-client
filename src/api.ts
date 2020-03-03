import { multinetApi } from 'multinet';

const host = process.env.VUE_APP_MULTINET_HOST || 'http://localhost:5000';
const api = multinetApi(`${host}/api`);

export default api;
