import { api, unwrap } from './client.js';

export const applicationsApi = {
  /** Returns `{ data, meta }`. The list is the only paginated endpoint. */
  list: (params) => api.get('/applications', { params }).then((res) => res.data),
  board: () => api.get('/applications/board').then(unwrap),
  followUps: () => api.get('/applications/follow-ups').then(unwrap),
  get: (id) => api.get(`/applications/${id}`).then(unwrap),
  create: (body) => api.post('/applications', body).then(unwrap),
  update: (id, changes) => api.patch(`/applications/${id}`, changes).then(unwrap),
  remove: (id) => api.delete(`/applications/${id}`),
};

export const statsApi = {
  overview: () => api.get('/stats/overview').then(unwrap),
};
