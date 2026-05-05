/**
 * useTheme — Centralized light/dark mode manager for Produs.
 *
 * - Reads initial mode from: user settings → localStorage → system preference
 * - Applies/removes the `.dark` class on <html>
 * - Persists chosen mode to localStorage immediately (no API call needed)
 * - Syncs with the backend via updateSettings when a user is logged in
 */

import { useEffect, useCallback } from 'react';
import useAuthStore from '../store/useAuthStore';

const STORAGE_KEY = 'produs-theme-mode'; // 'light' | 'dark' | 'system'

/**
 * Resolve the effective color scheme from a mode string.
 * @param {'light'|'dark'|'system'} mode
 * @returns {'light'|'dark'}
 */
export function resolveMode(mode) {
    if (mode === 'dark') return 'dark';
    if (mode === 'light') return 'light';
    // 'system' — follow the OS preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Apply the resolved mode to the DOM immediately (no React state required).
 * Safe to call before React renders (e.g. in index.html inline script).
 */
export function applyTheme(mode) {
    const resolved = resolveMode(mode);
    const html = document.documentElement;
    if (resolved === 'dark') {
        html.classList.add('dark');
    } else {
        html.classList.remove('dark');
    }
}

/**
 * React hook — call once at the Layout level.
 * Returns { themeMode, isDark, setThemeMode }
 */
export function useTheme() {
    const { user, updateSettings } = useAuthStore();

    // ── Bootstrap: pick the starting mode ──────────────────────────────────
    // Priority: user.settings.themeMode → localStorage → system
    const getInitialMode = useCallback(() => {
        if (user?.settings?.themeMode) return user.settings.themeMode;
        return localStorage.getItem(STORAGE_KEY) || 'system';
    }, [user?.settings?.themeMode]);

    // Apply on mount and whenever user settings arrive
    useEffect(() => {
        const mode = getInitialMode();
        applyTheme(mode);
        localStorage.setItem(STORAGE_KEY, mode);
    }, [getInitialMode]);

    // Also listen for OS-level changes when in 'system' mode
    useEffect(() => {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => {
            const stored = localStorage.getItem(STORAGE_KEY) || 'system';
            if (stored === 'system') applyTheme('system');
        };
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    // ── Public setter ───────────────────────────────────────────────────────
    const setThemeMode = useCallback(async (mode) => {
        // 1. Instant DOM update — no flicker
        applyTheme(mode);
        // 2. Persist locally
        localStorage.setItem(STORAGE_KEY, mode);
        // 3. Sync to backend (best-effort, won't block UI)
        if (user) {
            try {
                await updateSettings({ themeMode: mode });
            } catch {
                // silently ignore — local state is authoritative
            }
        }
    }, [user, updateSettings]);

    // ── Derived helpers ─────────────────────────────────────────────────────
    const currentMode = getInitialMode();
    const isDark = document.documentElement.classList.contains('dark');

    return { themeMode: currentMode, isDark, setThemeMode };
}
