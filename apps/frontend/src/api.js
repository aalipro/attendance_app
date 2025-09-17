import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
});

export function handleError(err) {
  const msg = err?.response?.data?.error?.message || err.message || 'Erreur';
  return msg;
}

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('auth_token', token);
  }
}

export function clearAuthToken() {
  delete api.defaults.headers.common['Authorization'];
  localStorage.removeItem('auth_token');
}

// Load token on boot if exists
const saved = localStorage.getItem('auth_token');
if (saved) setAuthToken(saved);

// Interceptor: on 401, clear token
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      clearAuthToken();
    }
    return Promise.reject(error);
  },
);
