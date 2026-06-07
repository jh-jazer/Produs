import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import { useRegisterSW } from 'virtual:pwa-register/react';
import Intellectual from './pages/Intellectual';
import Home from './pages/Home';
import Financial from './pages/Financial';
import Physical from './pages/Physical';
import Writing from './pages/Writing';
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
import EventCalendar from './pages/EventCalendar';
import FocusTimer from './pages/FocusTimer';
import LinkPage from './pages/Link';
import HeroPage from './pages/hero';
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
        <Route path="/landing" element={<Landing />} />

        {/* Root redirects to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/manual" element={<Manual />} />
        <Route path="/classes" element={<Classes />} />
        <Route path="/updates" element={<PatchNotes />} />

        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Public Profile Route */}
        <Route path="/u/:username" element={<PublicProfile />} />

        {/* Protected Dashboard Routes */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Home />} />
          <Route path="herodashboard" element={<HeroPage />} />
          <Route path="linkdashboard" element={<LinkPage />} />
          <Route path="dashboard/link" element={<Navigate to="/linkdashboard" replace />} />
          
          <Route path="dashboard/intellectual" element={<Intellectual />} />
          <Route path="dashboard/habits" element={<HabitMatrix />} />
          <Route path="dashboard/planner" element={<TacticalPlanner />} />
          <Route path="dashboard/goals" element={<GoalSetterPage />} />
          <Route path="dashboard/calendar" element={<EventCalendar />} />
          
          <Route path="dashboard/financial" element={<Financial />} />
          <Route path="dashboard/physical" element={<Physical />} />
          <Route path="dashboard/spiritual" element={<Writing />} />
          <Route path="dashboard/writing" element={<Writing />} />
          <Route path="dashboard/writing/journal" element={<Writing />} />
          <Route path="dashboard/writing/journal/:entryId" element={<Writing />} />
          <Route path="dashboard/writing/notes" element={<Writing />} />
          <Route path="dashboard/writing/notes/:noteId" element={<Writing />} />
          <Route path="dashboard/writing/lists" element={<Writing />} />
          <Route path="dashboard/writing/lists/:listId" element={<Writing />} />
          <Route path="dashboard/writing/shared" element={<Writing />} />
          <Route path="dashboard/writing/shared/:sharedId" element={<Writing />} />
          <Route path="dashboard/merchant" element={<Merchant />} />
          
          <Route path="dashboard/finance" element={<Navigate to="/dashboard/financial" replace />} />
          <Route path="dashboard/health" element={<Navigate to="/dashboard/physical" replace />} />
          <Route path="dashboard/journal" element={<Navigate to="/dashboard/spiritual" replace />} />
          
          <Route path="dashboard/mental" element={<Navigate to="/dashboard/intellectual" replace />} />
          
          <Route path="dashboard/profile" element={<Profile />} />
          <Route path="dashboard/admin" element={<AdminRoute><Admin /></AdminRoute>} />
        </Route>

        <Route path="/dashboard/neural-sync" element={<ProtectedRoute><NeuralSyncPage /></ProtectedRoute>} />
        <Route path="/focustimer" element={<ProtectedRoute><FocusTimer /></ProtectedRoute>} />
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
