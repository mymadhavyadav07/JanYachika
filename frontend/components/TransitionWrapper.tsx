"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./TransitionWrapper.module.css";

const TransitionWrapper = ({ children }: { children: React.ReactNode }) => {
  const [isAnimating, setIsAnimating] = useState(true);
  
  // Initialize mobile state more intelligently
  const [isMobile, setIsMobile] = useState(() => {
    // Try to detect mobile on initial render
    if (typeof window !== 'undefined') {
      const isMobileWidth = window.innerWidth <= 768;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      return isMobileWidth || (isTouchDevice && window.innerWidth <= 1024);
    }
    return false;
  });
  
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      if (typeof window === 'undefined') return false;
      
      const isMobileWidth = window.innerWidth <= 768;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      const mobile = isMobileWidth || (isTouchDevice && window.innerWidth <= 1024);
      setIsMobile(mobile);
      return mobile;
    };

    setIsClient(true);
    
    const initialMobile = checkMobile();
    
    window.addEventListener('resize', checkMobile);

    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 1000); // animation duration

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);


  return (
    <div className={styles.container}>
      <AnimatePresence>
        {isAnimating && (
          <motion.div
            key="transition"
            initial={{ y: 0 }}
            animate={{ y: "-100%" }}
            exit={{ y: "-100%" }}
            transition={{ duration: 1.3, ease: "easeInOut" }}
            className={styles.imageWrapper}
          >
            {/* Desktop image */}
            <img
              src="/loader.png"
              alt="Desktop Transition"
              className={`${styles.image} ${styles.desktopImage}`}
            />
            {/* Mobile image */}
            <img
              src="/phone_loader.png"
              alt="Mobile Transition"
              className={`${styles.image} ${styles.mobileImage}`}
              onError={(e) => {
                console.log('Mobile image failed to load');
                e.currentTarget.style.display = 'none';
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <div className={styles.pageContent}>{children}</div>
    </div>
  );
};

export default TransitionWrapper;
