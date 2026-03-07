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
import PublicProfile from './pages/PublicProfile';
import useAuthStore from './store/useAuthStore';

// Simple wrapper to protect routes
const ProtectedRoute = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

function AnimatedRoutes() {
  const user = useAuthStore((state) => state.user);
  const transitionKey = location.pathname.startsWith('/auth') ? 'auth' : 'app';

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={transitionKey}>
        {/* Public Landing Page */}
        <Route path="/" element={
          user && user.onboardingCompleted ? <Navigate to="/dashboard" replace /> : <Landing />
        } />

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
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;
