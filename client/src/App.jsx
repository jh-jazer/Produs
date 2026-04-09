import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import { useRegisterSW } from 'virtual:pwa-register/react';
import Habits from './pages/Habits';
import Overview from './pages/Overview';
import Planner from './pages/Planner';
import Finance from './pages/Finance';
import Health from './pages/Health';
import Journal from './pages/Journal';
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
    <AnimatePresence initial={false}>
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
          <Route index element={<Overview />} />
          <Route path="habits" element={<Habits />} />
          <Route path="planner" element={<Planner />} />
          <Route path="finance" element={<Finance />} />
          <Route path="health" element={<Health />} />
          <Route path="journal" element={<Journal />} />
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

function App() {
  const user = useAuthStore((state) => state.user);

  // Auto-reload when a new service-worker version is waiting.
  // This ensures users always run the latest deployed code.
  useRegisterSW({
    onNeedRefresh(updateSW) {
      updateSW(true); // skip waiting and reload all tabs immediately
    },
  });

  useEffect(() => {
    // Theme Management logic
    const themeMode = user?.settings?.themeMode || 'system';
    const isDark = user?.settings?.darkMode;

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
  }, [user?.settings?.themeMode]);

  useEffect(() => {
    // Hide the initial loader once auth state is settled.
    // We give it a small extra buffer to ensure the first mount is stable.
    if (typeof window.hideInitialLoader === 'function') {
      window.hideInitialLoader();
    }
  }, []);


  return (
    <SWRConfig value={swrGlobalConfig}>
      <BrowserRouter>
        <AnimatedRoutes />
        <DevTools />
      </BrowserRouter>
    </SWRConfig>
  );
}

export default App;
