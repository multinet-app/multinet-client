import { getCurrentToken } from '@girder/core/auth';
import { getApiRoot } from '@girder/core/rest';
import axios from 'axios'

export default function () {
  return axios.create({
    baseURL: getApiRoot(),
    headers: {'Girder-Token': getCurrentToken()}
  })
}
