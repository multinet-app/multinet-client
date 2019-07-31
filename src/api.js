import axios from 'axios'

function getApiRoot() {
  return `${window.location.origin}/api/v1`;
}

export default function () {
  return axios.create({
    baseURL: getApiRoot(),
  })
}
