import React from 'react';

const Avatar = ({ config, className = "size-full" }) => {
    // Determine the source URL
    // If config is a string (URL or Path), use it. Otherwise use the default placeholder.
    const src = (typeof config === 'string' && config.length > 0) 
        ? (config.startsWith('http') ? config : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${config}`)
        : '/default.webp';

    return (
        <div className={`${className} overflow-hidden rounded-sm bg-foreground/5`}>
            <img 
                src={src} 
                alt="Identity" 
                className="size-full object-cover" 
                onError={(e) => {
                    if (e.target.src !== window.location.origin + '/default.webp') {
                        e.target.src = '/default.webp';
                    }
                }}
            />
        </div>
    );
};

export default Avatar;
