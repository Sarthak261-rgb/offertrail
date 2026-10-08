import { api, unwrap } from './client.js';

export const authApi = {
  me: () => api.get('/auth/me').then(unwrap),
  login: (credentials) => api.post('/auth/login', credentials).then(unwrap),
  register: (details) => api.post('/auth/register', details).then(unwrap),
  logout: () => api.post('/auth/logout'),
};
