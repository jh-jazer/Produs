import React, { useState } from 'react';
import { useOutlet } from 'react-router-dom';

export const DashboardContext = React.createContext();

export function FrozenRoute({ context }) {
    const outlet = useOutlet();
    const [frozenOutlet] = useState(outlet);
    
    return (
        <DashboardContext.Provider value={context}>
            {frozenOutlet}
        </DashboardContext.Provider>
    );
}
