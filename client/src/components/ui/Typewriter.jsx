import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * Typewriter Component - Animates text character by character for cinematic feel.
 */
const Typewriter = ({ text, speed = 25, onComplete, multiplier = 1, className = "" }) => {
    const [displayedText, setDisplayedText] = useState("");
    const [isComplete, setIsComplete] = useState(false);
    const speedRef = useRef(speed / multiplier);

    // Sync ref with current speed/multiplier
    useEffect(() => {
        speedRef.current = Math.max(2, speed / multiplier);
    }, [speed, multiplier]);

    useEffect(() => {
        setDisplayedText("");
        setIsComplete(false);
        let i = 0;
        let timeoutId;

        const type = () => {
            if (i < text.length) {
                setDisplayedText(text.slice(0, i + 1));
                i++;
                timeoutId = setTimeout(type, speedRef.current);
            } else {
                setIsComplete(true);
                if (onComplete) onComplete();
            }
        };

        timeoutId = setTimeout(type, speedRef.current);
        return () => clearTimeout(timeoutId);
    }, [text]);

    return (
        <span className={`leading-relaxed whitespace-pre-wrap ${className}`}>
            {displayedText}
            {!isComplete && (
                <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="inline-block w-1.5 h-4 ml-1 bg-rose-500 align-middle shadow-[0_0_10px_rgba(244,63,94,0.5)]"
                />
            )}
        </span>
    );
};

export default Typewriter;
