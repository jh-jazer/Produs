import React, { useState } from 'react';

const Avatar = ({ config, className = "size-full" }) => {
    const [hasError, setHasError] = useState(false);

    // Determine the source URL
    // If config is a string (URL or Path), use it. Otherwise use the default placeholder.
    const src = (typeof config === 'string' && config.length > 0) 
        ? (config.startsWith('http') ? config : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${config}`)
        : '/default.webp';

    if (hasError || !config) {
        return (
            <div className={`${className} flex items-center justify-center bg-black/5 dark:bg-white/5 text-black/35 dark:text-white/30 rounded-full`}>
                <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
        );
    }

    return (
        <div className={`${className} overflow-hidden rounded-full`}>
            <img 
                src={src} 
                alt="" 
                className="size-full object-cover" 
                onError={() => setHasError(true)}
            />
        </div>
    );
};

export default Avatar;
