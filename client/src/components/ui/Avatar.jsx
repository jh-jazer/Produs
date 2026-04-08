/* eslint-disable */
import React from 'react';

const Avatar = ({ config, className = "size-full" }) => {
    // Default config if missing
    const {
        skin = "#F3C5A5",
        hair = "short",
        hairColor = "#4A2C2A",
        eyes = "default",
        clothing = "hoodie",
        clothingColor = "#3B82F6"
    } = config || {};

    return (
        <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Background (optional circular frame) */}
            <circle cx="50" cy="50" r="50" fill="currentColor" className="text-slate-100 dark:text-slate-800" />

            {/* Body/Clothing */}
            {clothing === "hoodie" && (
                <path
                    d="M20 90C20 75 30 65 50 65C70 65 80 75 80 90V100H20V90Z"
                    fill={clothingColor}
                />
            )}
            {clothing === "shirt" && (
                <path
                    d="M25 85C25 75 35 70 50 70C65 70 75 75 75 85V100H25V85Z"
                    fill={clothingColor}
                />
            )}
            {clothing === "tank" && (
                <path
                    d="M30 80C30 75 35 72 50 72C65 72 70 75 70 80V100H30V80Z"
                    fill={clothingColor}
                />
            )}

            {/* Neck */}
            <rect x="44" y="60" width="12" height="10" fill={skin} />

            {/* Head */}
            <circle cx="50" cy="40" r="25" fill={skin} />

            {/* Eyes */}
            {eyes === "default" && (
                <>
                    <circle cx="42" cy="38" r="2" fill="#2D3748" />
                    <circle cx="58" cy="38" r="2" fill="#2D3748" />
                </>
            )}
            {eyes === "happy" && (
                <>
                    <path d="M38 38C38 36 42 36 42 38" stroke="#2D3748" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M58 38C58 36 62 36 62 38" stroke="#2D3748" strokeWidth="1.5" strokeLinecap="round" />
                </>
            )}
            {eyes === "sleepy" && (
                <>
                    <path d="M38 40L44 40" stroke="#2D3748" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M56 40L62 40" stroke="#2D3748" strokeWidth="1.5" strokeLinecap="round" />
                </>
            )}

            {/* Mouth */}
            <path d="M45 52C45 52 47 55 50 55C53 55 55 52 55 52" stroke="#2D3748" strokeWidth="1.5" strokeLinecap="round" />

            {/* Hair */}
            {hair === "short" && (
                <path
                    d="M25 40C25 25 35 15 50 15C65 15 75 25 75 40V45C75 45 70 42 65 42C60 42 55 45 50 45C45 45 40 42 35 42C30 42 25 45 25 45V40Z"
                    fill={hairColor}
                />
            )}
            {hair === "long" && (
                <path
                    d="M25 40C25 25 35 15 50 15C65 15 75 25 75 40V70H65V42L50 45L35 42V70H25V40Z"
                    fill={hairColor}
                />
            )}
            {hair === "bob" && (
                <path
                    d="M22 40C22 25 32 15 50 15C68 15 78 25 78 40V55H70V42C70 42 63 42 58 42C53 42 50 45 50 45C50 45 47 42 42 42C37 42 30 42 30 42V55H22V40Z"
                    fill={hairColor}
                />
            )}
            {hair === "bald" && null}
        </svg>
    );
};

export default Avatar;
