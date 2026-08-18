/**
 * services/api.js
 * One Axios instance for the whole application.
 *
 * - the base URL comes from the VITE_API_URL environment variable
 * - a request interceptor attaches "Authorization: Bearer <token>"
 * - a response interceptor turns any backend error into a plain message
 *
 * Components never call axios directly; they use the helpers below.
 */

import axios from 'axios';

export const TOKEN_KEY = 'skillexchange_token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

/* ----------------------------- interceptors ----------------------------- */

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Build one readable message no matter what went wrong
    let message = 'Something went wrong. Please try again.';

    if (error.response) {
      message = error.response.data?.message || `Request failed (${error.response.status})`;
    } else if (error.code === 'ECONNABORTED') {
      message = 'The server took too long to respond. Please try again.';
    } else if (error.request) {
      message = 'Cannot reach the server. Is the backend running?';
    }

    return Promise.reject(Object.assign(new Error(message), {
      status: error.response?.status,
    }));
  }
);

/* ------------------------------ auth calls ------------------------------ */

export const registerUser = (data) => api.post('/auth/register', data).then((r) => r.data);
export const loginUser = (data) => api.post('/auth/login', data).then((r) => r.data);
export const getCurrentUser = () => api.get('/auth/me').then((r) => r.data.user);

/* ----------------------------- profile calls ---------------------------- */

export const getProfile = () => api.get('/users/profile').then((r) => r.data);
export const updateProfile = (data) => api.put('/users/profile', data).then((r) => r.data);

/* ----------------------------- listing calls ---------------------------- */

export const getListings = (params = {}) => {
  // Remove empty / "All" values so the URL stays clean
  const query = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value && value !== 'All') query[key] = value;
  });
  return api.get('/listings', { params: query }).then((r) => r.data);
};

export const getMyListings = () => api.get('/listings/my').then((r) => r.data);
export const getListing = (id) => api.get(`/listings/${id}`).then((r) => r.data);
export const createListing = (data) => api.post('/listings', data).then((r) => r.data);
export const updateListing = (id, data) => api.put(`/listings/${id}`, data).then((r) => r.data);
export const deleteListing = (id) => api.delete(`/listings/${id}`).then((r) => r.data);

/* ------------------------------ swap calls ------------------------------ */

export const sendSwapRequest = (data) => api.post('/swaps', data).then((r) => r.data);
export const getSwapRequests = () => api.get('/swaps/my-requests').then((r) => r.data);
export const updateSwapRequest = (id, status) =>
  api.put(`/swaps/${id}`, { status }).then((r) => r.data);

export default api;
