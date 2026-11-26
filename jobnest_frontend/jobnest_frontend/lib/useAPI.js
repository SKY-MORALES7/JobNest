// lib/useAPI.js
// Small wrapper around the central `API` axios instance.

import API from './api';

const handle = (promise) => promise.then((res) => res.data);

const get = (endpoint, config) => handle(API.get(endpoint, config));
const post = (endpoint, data, config) => handle(API.post(endpoint, data, config));
const put = (endpoint, data, config) => handle(API.put(endpoint, data, config));
const del = (endpoint, config) => handle(API.delete(endpoint, config));

export default {
  get,
  post,
  put,
  // Provide both `.delete` and `.del` aliases since the codebase uses `useAPI.del` in places
  delete: del,
  del,
};
