"use client"

import { useTheme } from 'next-themes';
import React from 'react';


interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
}

const ShinyText: React.FC<ShinyTextProps> = ({ text, disabled = false, speed = 5, className = '' }) => {
  const animationDuration = `${speed}s`;
  const { theme } = useTheme();
  
  
  const backgroundImage =
    theme === "light"
      ? 'linear-gradient(120deg, rgba(255,255,255,0) 40%, rgba(0,0,0, 0.8) 50%, rgba(255,255,255,0) 60%)'
      : 'linear-gradient(120deg, rgba(255,255,255,0) 40%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 60%)';

  return (
    <div
      className={`dark:text-[#b5b5b5a4] text-[#00000052] bg-clip-text inline-block ${disabled ? '' : 'animate-shine'} ${className}`}
      style={{
        backgroundImage: backgroundImage,
          
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        animationDuration: animationDuration
      }}
    >
      {text}
    </div>
  );
};

export default ShinyText;


