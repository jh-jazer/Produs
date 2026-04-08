/* eslint-disable */
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

let authToken = null;

export const setAuthToken = (token) => {
    authToken = token;
};

// Request interceptor for adding JWT token
api.interceptors.request.use(
    (config) => {
        if (authToken) {
            config.headers.Authorization = `Bearer ${authToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to catch 401 Unauthorized errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            if (typeof window !== 'undefined') {
                window.location.href = '/auth';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
