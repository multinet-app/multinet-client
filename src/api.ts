import axios from 'axios';

import { multinetApi } from 'multinet';

function getApiRoot() {
  return `${window.location.origin}/api`;
}

export default function() {
  return axios.create({
    baseURL: getApiRoot(),
  });
}

export const apix = multinetApi(getApiRoot());
