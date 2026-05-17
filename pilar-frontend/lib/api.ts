import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: { 'Content-Type': 'application/json' },
});

// Auto attach token dari localStorage
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('pilar_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 — redirect ke login, kecuali untuk endpoint auth itu sendiri
// (login/register yang mengembalikan 401 karena credentials salah, bukan sesi expired)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const requestUrl = err.config?.url ?? '';
    const isAuthEndpoint = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');
    if (err.response?.status === 401 && !isAuthEndpoint && typeof window !== 'undefined') {
      localStorage.removeItem('pilar_token');
      localStorage.removeItem('pilar_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
