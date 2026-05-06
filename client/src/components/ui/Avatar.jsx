import React from 'react';

const Avatar = ({ config, className = "size-full" }) => {
    // If config is a string (URL), render as image
    if (typeof config === 'string' && config.startsWith('http')) {
        return (
            <div className={`${className} overflow-hidden rounded-sm bg-foreground/5`}>
                <img 
                    src={config} 
                    alt="Identity" 
                    className="size-full object-cover grayscale contrast-110 brightness-95 hover:grayscale-0 transition-all duration-500" 
                />
            </div>
        );
    }

    // Default config if missing or legacy object
    const {
        skin = "#F3C5A5",
        hair = "short",
        hairColor = "#4A2C2A",
        eyes = "default",
        clothing = "hoodie",
        clothingColor = "#3B82F6"
    } = (typeof config === 'object' ? config : {}) || {};

    return (
        <svg
            viewBox="0 0 75 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`${className} grayscale contrast-110 brightness-95`}
        >
            <defs>
                <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
                    <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
                </linearGradient>
            </defs>
            
            {/* Background Studio Effect */}
            <rect width="75" height="100" fill="url(#avatarGrad)" rx="0" />
            <circle cx="37.5" cy="40" r="40" fill="white" fillOpacity="0.03" />

            {/* Character Shadow on Background */}
            <ellipse cx="37.5" cy="95" rx="20" ry="3" fill="black" fillOpacity="0.1" />

            {/* Body/Clothing - Lower Half (Pants) */}
            <path
                d="M22 55L18 95H33L35 75L40 75L42 95H57L53 55H22Z"
                fill={clothingColor}
            />

            {/* Torso with Depth */}
            {clothing === "hoodie" && (
                <>
                    <path
                        d="M17 35C17 35 12 40 12 50C12 60 17 65 37.5 65C58 65 63 60 63 50C63 40 58 35 58 35H17Z"
                        fill={clothingColor}
                    />
                    <path d="M37.5 35V65" stroke="black" strokeOpacity="0.1" strokeWidth="0.5" />
                </>
            )}
            {(clothing === "shirt" || clothing === "tank") && (
                <path
                    d="M19.5 35C19.5 35 15.5 40 15.5 50C15.5 60 19.5 63 37.5 63C55.5 63 59.5 60 59.5 50C59.5 40 55.5 35 55.5 35H19.5Z"
                    fill={clothingColor}
                />
            )}

            {/* Neck */}
            <rect x="34.5" y="30" width="6" height="5" fill={skin} />

            {/* Head with Portrait Lighting */}
            <circle cx="37.5" cy="22" r="12" fill={skin} />
            <path d="M37.5 10A12 12 0 0 0 25.5 22H37.5Z" fill="white" fillOpacity="0.05" />

            {/* Eyes */}
            {eyes === "default" && (
                <>
                    <circle cx="33.5" cy="21" r="1.5" fill="#000000" />
                    <circle cx="41.5" cy="21" r="1.5" fill="#000000" />
                </>
            )}
            {eyes === "happy" && (
                <>
                    <path d="M31.5 21C31.5 20 34.5 20 34.5 21" stroke="#000000" strokeWidth="1" strokeLinecap="round" />
                    <path d="M40.5 21C40.5 20 43.5 20 43.5 21" stroke="#000000" strokeWidth="1" strokeLinecap="round" />
                </>
            )}
            {eyes === "sleepy" && (
                <>
                    <path d="M31.5 22H35.5" stroke="#000000" strokeWidth="1" strokeLinecap="round" />
                    <path d="M39.5 22H43.5" stroke="#000000" strokeWidth="1" strokeLinecap="round" />
                </>
            )}

            {/* Mouth */}
            <path d="M34.5 28C34.5 28 35.5 30 37.5 30C39.5 30 40.5 28 40.5 28" stroke="#000000" strokeWidth="1" strokeLinecap="round" />

            {/* Hair */}
            {hair === "short" && (
                <path
                    d="M25.5 22C25.5 15 29.5 10 37.5 10C45.5 10 49.5 15 49.5 22V25C49.5 25 47.5 23 45.5 23C42.5 23 40.5 25 37.5 25C34.5 25 32.5 23 29.5 23C27.5 23 25.5 25 25.5 25V22Z"
                    fill={hairColor}
                />
            )}
            {hair === "long" && (
                <path
                    d="M25.5 22C25.5 15 29.5 10 37.5 10C45.5 10 49.5 15 49.5 22V40H45.5V23L37.5 25L29.5 23V40H25.5V22Z"
                    fill={hairColor}
                />
            )}
            {hair === "bob" && (
                <path
                    d="M23.5 22C23.5 15 28.5 10 37.5 10C46.5 10 51.5 15 51.5 22V32H47.5V23C47.5 23 43.5 23 41.5 23C39.5 23 37.5 25 37.5 25C37.5 25 35.5 23 33.5 23C31.5 23 27.5 23 27.5 23V32H23.5V22Z"
                    fill={hairColor}
                />
            )}
            {hair === "bald" && null}
        </svg>
    );
};

export default Avatar;
