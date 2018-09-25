import axios from 'axios';

import { REQUEST_TIMEOUT } from './constants';

export const get = async (url, params, headers = {}) => {
  try {
    const res = await axios({
      method: 'get',
      url,
      headers,
      params,
      timeout: REQUEST_TIMEOUT,
    });
    return {
      success: true,
      data: res.data,
    };
  } catch (e) {
    return {
      success: false,
      error: JSON.stringify(e),
    };
  }
};

export const post = async (url, payload, headers = {}) => {
  try {
    const res = await axios({
      method: 'post',
      url,
      headers,
      data: payload,
      timeout: REQUEST_TIMEOUT,
    });
    return {
      success: true,
      data: res.data,
    };
  } catch (e) {
    return {
      success: false,
      error: JSON.stringify(e),
    };
  }
};
