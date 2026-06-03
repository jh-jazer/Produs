import { create } from 'zustand';
import api, { setAuthToken } from '../services/api';
import { soundManager } from '../services/sound';

// Only the minimal session identifiers are persisted to localStorage.
// Mutable fields (level, exp, rpg, settings, etc.) are NEVER cached here
// to ensure they are always fetched fresh from the server.
const PERSISTED_KEYS = ['_id', 'name', 'email', 'token'];

const pickPersisted = (data) => {
    if (!data) return null;
    return PERSISTED_KEYS.reduce((acc, key) => {
        if (data[key] !== undefined) acc[key] = data[key];
        return acc;
    }, {});
};

// Try to load any existing token/session info from localStorage safely
let storedSessionInfo = null;
try {
    const item = localStorage.getItem('userInfo');
    if (item && item !== 'undefined') {
        storedSessionInfo = JSON.parse(item);
        if (storedSessionInfo?.token) setAuthToken(storedSessionInfo.token);
    }
} catch (error) {
    console.error('Failed to parse userInfo from localStorage:', error);
}

const useAuthStore = create((set) => ({
    // On boot, user starts with only the minimal session data.
    // Full profile data (level, rpg, settings etc.) is loaded via SWR /auth/me
    user: storedSessionInfo,
    viewMode: 'me',
    isNeuralSyncDismissed: false,

    setViewMode: (mode) => set({ viewMode: mode }),
    setNeuralSyncDismissed: (bool) => set({ isNeuralSyncDismissed: bool }),

    setCredentials: (data) => {
        set({ user: data });
        if (data?.token) {
            setAuthToken(data.token);
        }
        // Only save minimal session data to localStorage
        localStorage.setItem('userInfo', JSON.stringify(pickPersisted(data)));
    },

    syncUser: (data) => {
        set((state) => {
            if (!state.user) return { user: data };

            // If data is just the RPG object, nest it correctly
            const rpgData = data.pendingQuestions ? { rpg: data } : data;

            const updatedUser = {
                ...state.user,
                ...rpgData,
                rpg: { ...state.user.rpg, ...(rpgData.rpg || {}) },
                token: state.user.token
            };

            // Sound triggers on XP, Level, or Archetype change
            const oldExp = state.user?.exp;
            const newExp = updatedUser?.exp;
            const oldLevel = state.user?.level;
            const newLevel = updatedUser?.level;
            const oldArchetype = state.user?.rpg?.tier1;
            const newArchetype = updatedUser?.rpg?.tier1;

            if (oldExp !== undefined && oldLevel !== undefined) {
                if (newLevel > oldLevel) {
                    setTimeout(() => soundManager.play('levelUp'), 50);
                } else if (newExp > oldExp) {
                    setTimeout(() => soundManager.play('xpGain'), 50);
                }
                if (newArchetype && oldArchetype && newArchetype !== oldArchetype) {
                    setTimeout(() => soundManager.play('evolution'), 500);
                }
            }

            // Do NOT persist mutable fields — only update in-memory state
            return { user: updatedUser };
        });
    },

    signOut: () => {
        set({ user: null });
        localStorage.removeItem('userInfo');
        setAuthToken(null);
    },

    updateSettings: async (settings) => {
        try {
            const { data } = await api.put('/auth/settings', settings);
            set((state) => {
                const updatedUser = { ...state.user, ...data };
                // Do NOT persist settings to localStorage
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
                // Do NOT persist onboarding result to localStorage
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
