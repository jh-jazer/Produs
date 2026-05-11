import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import { useRegisterSW } from 'virtual:pwa-register/react';
import Intellectual from './pages/Intellectual';
import Home from './pages/Home';
import Financial from './pages/Financial';
import Physical from './pages/Physical';
import Spiritual from './pages/Spiritual';
import Auth from './pages/Auth';
import AuthCallback from './pages/AuthCallback';
import Landing from './pages/Landing';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Manual from './pages/Manual';
import Classes from './pages/Classes';
import PatchNotes from './pages/PatchNotes';
import PublicProfile from './pages/PublicProfile';
import NeuralSyncPage from './pages/NeuralSyncPage';
import Merchant from './pages/Merchant';
import HabitMatrix from './pages/HabitMatrix';
import TacticalPlanner from './pages/TacticalPlanner';
import GoalSetterPage from './pages/GoalSetterPage';
import TemporalSync from './pages/TemporalSync';
import useAuthStore from './store/useAuthStore';
import { useEffect } from 'react';


// Simple wrapper to protect routes
const ProtectedRoute = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

const AdminRoute = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  if (!user || (user.email !== 'ernestodesabillejr@gmail.com' && !user.isAdmin)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AnimatedRoutes() {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const transitionKey = location.pathname.startsWith('/auth') ? 'auth' : 'app';

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<Landing />} />

        <Route path="/manual" element={<Manual />} />
        <Route path="/classes" element={<Classes />} />
        <Route path="/updates" element={<PatchNotes />} />

        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Public Profile Route */}
        <Route path="/u/:username" element={<PublicProfile />} />

        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Home />} />
          <Route path="intellectual" element={<Intellectual />} />
          <Route path="habits" element={<HabitMatrix />} />
          <Route path="planner" element={<TacticalPlanner />} />
          <Route path="goals" element={<GoalSetterPage />} />
          <Route path="calendar" element={<TemporalSync />} />
          
          <Route path="financial" element={<Financial />} />
          <Route path="physical" element={<Physical />} />
          <Route path="spiritual" element={<Spiritual />} />
          <Route path="merchant" element={<Merchant />} />
          
          <Route path="finance" element={<Navigate to="/dashboard/financial" replace />} />
          <Route path="health" element={<Navigate to="/dashboard/physical" replace />} />
          <Route path="journal" element={<Navigate to="/dashboard/spiritual" replace />} />
          
          <Route path="mental" element={<Navigate to="/dashboard/intellectual" replace />} />
          
          <Route path="profile" element={<Profile />} />
          <Route path="admin" element={<AdminRoute><Admin /></AdminRoute>} />
        </Route>

        <Route path="/dashboard/neural-sync" element={<ProtectedRoute><NeuralSyncPage /></ProtectedRoute>} />
      </Routes>
    </AnimatePresence>
  );
}

import { SWRConfig } from 'swr';
import api from './services/api';

const fetcher = url => api.get(url).then(res => res.data);

// Global SWR config: always fetch fresh data from the server on mount/focus/reconnect.
const swrGlobalConfig = {
    fetcher,
    revalidateOnMount: true,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 2000,  // 2 s — prevent duplicate requests in quick succession
};

import DevTools from './components/ui/DevTools';

import CinematicLoader from './components/ui/CinematicLoader';
import useLoadingStore from './store/useLoadingStore';

function App() {
  const user = useAuthStore((state) => state.user);
  const { isLoading, stopLoading } = useLoadingStore();

  // Auto-reload when a new service-worker version is waiting.
  // This ensures users always run the latest deployed code.
  useRegisterSW({
    onRegistered(r) {
      // Check for updates every hour to ensure people get the new version without refreshing manually
      if (r) {
        setInterval(() => {
          r.update();
        }, 60 * 60 * 1000);
      }
    },
    onNeedRefresh() {
      // Automatically refresh the page to apply the update for a seamless "auto update" experience.
      window.location.reload();
    },
  });

  useEffect(() => {
    // Theme Management logic
    const themeMode = user?.settings?.themeMode || 'system';
    const themeId = user?.settings?.theme || 'classic';

    const themes = {
      classic: '#135bec',
      rose: '#ec4899',
      forest: '#10b981',
      amber: '#f59e0b',
      midnight: '#6366f1'
    };

    // Apply Accent Color
    const accentColor = themes[themeId] || themes.classic;
    document.documentElement.style.setProperty('--primary', accentColor);
    document.documentElement.setAttribute('data-theme', themeId);

    const applyTheme = (mode) => {
      if (mode === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (mode === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        // System
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    // Initial apply
    applyTheme(themeMode);

    // If system, listen for changes
    if (themeMode === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = (e) => {
        document.documentElement.classList.toggle('dark', e.matches);
      };
      
      mq.addEventListener('change', listener);
      return () => mq.removeEventListener('change', listener);
    }
  }, [user?.settings?.themeMode, user?.settings?.theme]);

  const signOut = useAuthStore((state) => state.signOut);

  useEffect(() => {
    const handleUnauthorized = () => {
      signOut();
    };

    window.addEventListener('auth-unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth-unauthorized', handleUnauthorized);
  }, [signOut]);

  useEffect(() => {
    // Hide the initial loader once auth state is settled.
    // Syncing with cinematic global loader in index.html.
    if (typeof window.hideInitialLoader === 'function') {
      window.hideInitialLoader();
    }
  }, []);


  return (
    <SWRConfig value={swrGlobalConfig}>
      <BrowserRouter>
        <AnimatedRoutes />
        <DevTools />
        <CinematicLoader isVisible={isLoading} onComplete={stopLoading} />
      </BrowserRouter>
    </SWRConfig>
  );
}

export default App;
