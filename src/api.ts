import axios from 'axios';

function getApiRoot() {
  return `${window.location.origin}/api`;
}

export default function() {
  return axios.create({
    baseURL: getApiRoot(),
  });
}
