import React from 'react';

const GlitchTitle = ({ progress, threshold, original, target }) => {
  const [displayText, setDisplayText] = React.useState(original);
  const [isGlitched, setIsGlitched] = React.useState(false);
  
  const chars = "!@#$%^&*()_+-=[]{}|;:,.<>?";

  React.useEffect(() => {
    if (progress > threshold && !isGlitched) {
      setIsGlitched(true);
      let count = 0;
      const interval = setInterval(() => {
        setDisplayText(prev => 
          target.split('').map((c, i) => c === ' ' ? ' ' : (Math.random() > 0.5 ? chars[Math.floor(Math.random() * chars.length)] : target[i])).join('')
        );
        count++;
        if (count > 5) {
          clearInterval(interval);
          setDisplayText(target);
        }
      }, 50);
    } else if (progress <= threshold && isGlitched) {
      setIsGlitched(false);
      setDisplayText(original);
    }
  }, [progress, threshold, original, target, isGlitched]);

  return <span>{displayText}</span>;
};

export default GlitchTitle;
