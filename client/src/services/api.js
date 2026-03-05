import axios from 'axios';
import useAuthStore from '../store/useAuthStore.js';

// Create an Axios instance pointing to the proxy defined in vite.config.js
// Or to the production URL if deployed
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for adding JWT token
api.interceptors.request.use(
    (config) => {
        const { user } = useAuthStore.getState();
        if (user && user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to catch 401 Unauthorized errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token expired or invalid
            useAuthStore.getState().logout();
            window.location.href = '/auth';
        }
        return Promise.reject(error);
    }
);

export default api;
