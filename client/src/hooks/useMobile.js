import { useState, useEffect } from 'react';

/**
 * Hook to detect if the device should show the mobile view.
 * It considers both the screen width and the orientation for tablets.
 *
 * Parity with index.css:
 * Mobile view is shown when NOT (width >= 48rem AND orientation: landscape)
 */
export const useMobile = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Query matches 'Desktop/Tablet' mode. If NOT matched, it's 'Mobile' mode.
        const desktopQuery = window.matchMedia('(min-width: 48rem) and (orientation: landscape)');

        const checkMobile = () => {
            setIsMobile(!desktopQuery.matches);
        };

        checkMobile();

        desktopQuery.addEventListener('change', checkMobile);

        return () => {
            desktopQuery.removeEventListener('change', checkMobile);
        };
    }, []);

    return isMobile;
};

export default useMobile;
