import axios from 'axios';

// FORCE the Render URL if the Environment Variable is missing
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://mailvox-backend.onrender.com';

const api = axios.create({
  baseURL: `${backendUrl}/api`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mailvox_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const msg = err.response?.data?.error || err.message || 'Something went wrong';
    return Promise.reject(new Error(msg));
  }
);

export const auth = {
  googleCallback: (credential) =>
    api.post('/auth/google/callback', { credential }),
  // ADDED: This is required for the Connect Gmail button to work
  connectGmail: (access_token) => 
    api.post('/auth/connect-gmail', { access_token }),
  me: () => api.get('/auth/me'),
};

export const generate = { email: (data) => api.post('/generate', data) };
export const send = { email: (data) => api.post('/send', data) };
export const bulk = { send: (data) => api.post('/bulk/send', data) };

export const schedule = {
  list: () => api.get('/schedule'),
  create: (data) => api.post('/schedule', data),
  cancel: (id) => api.delete(`/schedule/${id}`),
};

export const templates = {
  list: () => api.get('/templates'),
  create: (data) => api.post('/templates', data),
  update: (id, data) => api.put(`/templates/${id}`, data),
  delete: (id) => api.delete(`/templates/${id}`),
};

export const history = { list: () => api.get('/history') };

export default api;