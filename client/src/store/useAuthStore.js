import { create } from 'zustand';
import api from '../services/api';

// Try to load any existing token/user info from localStorage safely
let storedUserInfo = null;
try {
    const item = localStorage.getItem('userInfo');
    if (item && item !== 'undefined') {
        storedUserInfo = JSON.parse(item);
    }
} catch (error) {
    console.error('Failed to parse userInfo from localStorage:', error);
}

const useAuthStore = create((set) => ({
    user: storedUserInfo,

    setCredentials: (data) => {
        set({ user: data });
        localStorage.setItem('userInfo', JSON.stringify(data));
    },

    logout: () => {
        set({ user: null });
        localStorage.removeItem('userInfo');
    },

    updateSettings: async (settings) => {
        try {
            const { data } = await api.put('/auth/settings', settings);
            set((state) => {
                const updatedUser = { ...state.user, ...data };
                localStorage.setItem('userInfo', JSON.stringify(updatedUser));
                return { user: updatedUser };
            });
            return data;
        } catch (error) {
            console.error('Failed to update settings:', error);
            throw error;
        }
    },

    deleteAccount: async () => {
        try {
            await api.delete('/auth/me');
            set({ user: null });
            localStorage.removeItem('userInfo');
        } catch (error) {
            console.error('Failed to delete account:', error);
            throw error;
        }
    },

    completeOnboarding: async (onboardingData) => {
        try {
            const { data } = await api.put('/auth/onboarding', onboardingData);
            set((state) => {
                const updatedUser = { ...state.user, ...data };
                localStorage.setItem('userInfo', JSON.stringify(updatedUser));
                return { user: updatedUser };
            });
            return data;
        } catch (error) {
            console.error('Failed to complete onboarding:', error);
            throw error;
        }
    }
}));

export default useAuthStore;
