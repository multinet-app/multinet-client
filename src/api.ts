import { multinetApi } from 'multinet';

function getApiRoot() {
  return `${window.location.origin}/api`;
}

const api = multinetApi(getApiRoot());

export default api;
