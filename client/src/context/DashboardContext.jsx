import React from 'react';

export const DashboardContext = React.createContext();

// The FrozenRoute is removed to prevent unmount-locks during transitions.
// We are reverting to a simpler context strategy.
