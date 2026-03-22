import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import Habits from './pages/Habits';
import Overview from './pages/Overview';
import Planner from './pages/Planner';
import Finance from './pages/Finance';
import Journal from './pages/Journal';
import Auth from './pages/Auth';
import AuthCallback from './pages/AuthCallback';
import Landing from './pages/Landing';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import PublicProfile from './pages/PublicProfile';
import useAuthStore from './store/useAuthStore';
import useConnectivityStore from './store/useConnectivityStore';
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
  if (!user || user.email !== 'ernestodesabillejr@gmail.com') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AnimatedRoutes() {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const transitionKey = location.pathname.startsWith('/auth') ? 'auth' : 'app';

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={transitionKey}>
        {/* Public Landing Page */}
        <Route path="/" element={<Landing />} />

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
          <Route path="journal" element={<Journal />} />
          <Route path="profile" element={<Profile />} />
          <Route path="admin" element={<AdminRoute><Admin /></AdminRoute>} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

import { SWRConfig } from 'swr';
import api from './services/api';

const fetcher = url => api.get(url).then(res => res.data);

function App() {
  const setOnline = useConnectivityStore((state) => state.setOnline);
  const setIsSyncing = useConnectivityStore((state) => state.setIsSyncing);
  const offlineQueue = useConnectivityStore((state) => state.offlineQueue);
  const removeFromQueue = useConnectivityStore((state) => state.removeFromQueue);

  const processQueue = async () => {
    if (offlineQueue.length === 0) return;
    
    setIsSyncing(true);
    // Process one by one to maintain order
    for (const item of offlineQueue) {
      try {
        if (item.method === 'POST') {
          await api.post(item.url, item.data);
        } else if (item.method === 'DELETE') {
          await api.delete(item.url);
        } else if (item.method === 'PATCH') {
          await api.patch(item.url, item.data);
        }
        removeFromQueue(item.id);
      } catch (error) {
        console.error('Failed to sync offline item:', item, error);
        // If it's a permanent error (e.g. 400), we might want to remove it anyway
        // For now, let's just log and continue to next
      }
    }
    setIsSyncing(false);
  };

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      processQueue();
    };
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Also try to process queue on mount if online
    if (navigator.onLine) {
      processQueue();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnline, setIsSyncing, offlineQueue.length]); // Re-run if queue length changes while online

  return (

    <SWRConfig value={{ fetcher }}>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </SWRConfig>
  );
}

export default App;
