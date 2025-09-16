import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

export function handleError(err) {
  const res = err.response;
  if (res?.data?.error?.message) {
    return res.data.error.message;
  }
  return 'Erreur réseau';
}
