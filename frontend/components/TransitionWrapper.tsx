"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./TransitionWrapper.module.css";

const TransitionWrapper = ({ children }: { children: React.ReactNode }) => {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 1000); // animation duration

    return () => clearTimeout(timer);
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
            <img
              src="/loader.png"
              alt="Transition Landscape"
              className={styles.image}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <div className={styles.pageContent}>{children}</div>
    </div>
  );
};

export default TransitionWrapper;
