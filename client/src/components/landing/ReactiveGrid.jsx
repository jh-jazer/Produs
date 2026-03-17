import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export const ReactiveGrid = () => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springX = useSpring(mouseX, { stiffness: 100, damping: 30 });
    const springY = useSpring(mouseY, { stiffness: 100, damping: 30 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            {/* Base Grid */}
            <div className="absolute inset-0 bg-grid opacity-30" />

            {/* Glowing Reactive Layer */}
            <motion.div
                style={{
                    left: springX,
                    top: springY,
                    background: "radial-gradient(circle at center, rgba(0, 102, 255, 0.15) 0%, transparent 400px)"
                }}
                className="absolute size-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            />

            {/* Grain & Scanlines for added depth */}
            <div className="absolute inset-0 grain-overlay" />
            <div className="absolute inset-0 scanlines opacity-[0.05]" />
        </div>
    );
};
