import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * CinematicLoader — Repurposed as a subtle page transition overlay.
 * 
 * Instead of a 4-second fake loading screen with tips and a progress bar,
 * this is now a quick 300ms fade-to-black wipe that feels intentional
 * but respects the user's time.
 */
const CinematicLoader = ({ isVisible, onComplete }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          onAnimationComplete={(definition) => {
            // Fire onComplete after the enter animation finishes,
            // giving the page behind time to mount before the exit fade
            if (definition.opacity === 1) {
              setTimeout(() => {
                onComplete?.();
              }, 150);
            }
          }}
          className="fixed inset-0 z-[99999] bg-black pointer-events-none"
        />
      )}
    </AnimatePresence>
  );
};

export default CinematicLoader;
