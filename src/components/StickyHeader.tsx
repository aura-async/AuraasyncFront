import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

const StickyHeader = () => {
  const router=useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      setIsScrolled(scrollTop > 100);
    };

    const handleAnimationComplete = () => {
      setTimeout(() => {
        setIsVisible(true);
        setIsScrolled(true); // Show header immediately when homepage renders
      }, 500);
    };

    // Listen for the landing animation complete event
    window.addEventListener('landingAnimationComplete', handleAnimationComplete);
    
    // Show header immediately if we're past the landing section
    if (window.scrollY > 100 || document.querySelector('.landing-complete')) {
      setIsVisible(true);
      setIsScrolled(true); // Show header immediately when homepage renders
    }

    // Listen for scroll events
    window.addEventListener('scroll', handleScroll);
    
    // Check initial scroll position
    handleScroll();

    return () => {
      window.removeEventListener('landingAnimationComplete', handleAnimationComplete);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed top-0 left-0 w-full z-[9998] bg-transparent"
        >
          <div className="flex justify-between items-center px-6 py-4 pt-8">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <span className="text-white text-[2rem] font-semibold">Auraasync</span>
            </div>

            {/* Auth Links */}
            <div
            onClick={()=>router.push('/onboarding')}
             className="flex items-center space-x-0.05 text-white font-medium text-lg mr-10">
              <button className="w-[104px] h-[38px] flex items-center justify-center hover:text-gray-300 transition-colors duration-200">Get started</button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StickyHeader;
