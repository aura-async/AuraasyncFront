import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaInstagram, FaFacebookF, FaTwitter, FaLinkedinIn, FaYoutube } from "react-icons/fa";
import Navbar from "./Navbar";
import StickyHeader from "@/components/StickyHeader";
import MobileHero from '@/app/assets/HeroGuestMobile.png'
import Image from "next/image";


export default function AuraasyncSlideReveal() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [circleDone, setCircleDone] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (!loading) return;
    let start = null;
    const duration = 1800;

    const animateBar = (ts) => {
      if (!start) start = ts;
      const elapsed = ts - (start || ts);
      const percent = Math.min((elapsed / duration) * 100, 200);
      setProgress(percent);

      if (percent < 100) {
        requestAnimationFrame(animateBar);
      } else {
        setTimeout(() => setLoading(false), 400);
      }
    };

    requestAnimationFrame(animateBar);
  }, [loading]);

  useEffect(() => {
    if (circleDone) {
      const timeout = setTimeout(() => {
        setShowContent(true);
        // Dispatch custom event when animation is complete
        window.dispatchEvent(new CustomEvent('landingAnimationComplete'));
        // Add class to body for navbar visibility
        document.body.classList.add('landing-complete');
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [circleDone]);

  // Handle page reload from scrolled position
  useEffect(() => {
    const handleReload = () => {
      // If page is reloaded while scrolled down, show content immediately
      if (window.scrollY > 100 || document.documentElement.scrollTop > 100) {
        setShowContent(true);
        document.body.classList.add('landing-complete');
        window.dispatchEvent(new CustomEvent('landingAnimationComplete'));
      }
    };

    // Check on mount
    handleReload();
    
    // Also check after a short delay to ensure DOM is ready
    setTimeout(handleReload, 100);
    setTimeout(handleReload, 500);
    setTimeout(handleReload, 1000);
    
    window.addEventListener('load', handleReload);
    window.addEventListener('DOMContentLoaded', handleReload);
    
    return () => {
      window.removeEventListener('load', handleReload);
      window.removeEventListener('DOMContentLoaded', handleReload);
    };
  }, []);

  // Simple navbar visibility trigger
  useEffect(() => {
    if (showContent) {
      // Trigger navbar visibility when homepage content is shown
      document.body.classList.add('landing-complete');
      window.dispatchEvent(new CustomEvent('landingAnimationComplete'));
    }
  }, [showContent]);

  return (
    <div className={`relative w-full h-screen overflow-hidden ${loading ? "bg-white" : "bg-black"} transition-colors duration-500`}>
      {/* Sticky Header - Always visible after landing animation */}
      {showContent && <StickyHeader />}
      
      {/* Navbar - Always visible after landing animation */}
      {showContent && <Navbar />}

      {/* 🔄 Minimal Loader */}
      <AnimatePresence>
        {loading && (
          <motion.div
            key="loader"
            className="fixed inset-0 z-50 px-22 md:px-0 flex flex-col items-center justify-center bg-[#2a2a33]"
            exit={{ opacity: 0, transition: { duration: 0.9 } }}
          >
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="text-6xl popin md:text-8xl lg:text-9xl font-extrabold mb-12"
              style={{ color: '#Af956a' }}
            >
              Auraasync
            </motion.h1>
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 380, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="relative h-1 md:h-2 bg-gray-300  rounded-full overflow-hidden"
            >
              <div
                className="h-full  transition-all ease-linear"
                style={{ 
                  width: `${progress}%`,
                  backgroundColor: '#af956a'
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ⚫ Circle Expansion */}
      {!loading && !circleDone && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 80 }}
          transition={{ duration: 1.7, ease: "easeInOut" }}
          onAnimationComplete={() => setCircleDone(true)}
          className="fixed inset-0 flex items-center justify-center z-40"
        >
          <div className="w-40 h-40 rounded-full" style={{ backgroundColor: '#251f1e' }} />
        </motion.div>
      )}

      {/* 🌄 Final Content */}
      {showContent && (
        <div className="absolute inset-0 z-50 bg-black overflow-hidden">

          {/* 📸 Background Image: Responsive */}
          <>
            {/* Desktop Image */}
            <motion.img
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.4, ease: "easeOut" }}
              src="/Homepage.png"
              alt="Desktop Background"
              className="hidden md:block w-full h-full object-cover"
              draggable={false}
            />

            {/* Mobile Image */}
            <Image

              src={MobileHero}
              alt="Mobile Background"
              className="block md:hidden w-full h-full object-cover"
            />
          </>

          {/* Sticky header is now handled by StickyHeader component */}

          {/* Center Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="absolute inset-0 flex items-center justify-center z-50 px-4"
          >
            <div className="text-center text-white max-w-3xl mx-auto">
              <h1
                id="hero-heading"
                className="text-3xl md:text-5xl font-bold"
              >
                Let&apos;s Explore Unique Clothes
              </h1>
              <p className="mt-4 text-base md:text-lg font-light">
                According to your style and preference with{" "}
                <span className="font-semibold">Auraasync</span>
              </p>
            </div>
          </motion.div>

          {/* Social Icons */}
          <div className="absolute bottom-6 right-6 z-50 flex flex-col space-y-4 text-white text-xl">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500"><FaInstagram /></a>
            {/* <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500"><FaFacebookF /></a> */}
            {/* <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-sky-400"><FaTwitter /></a> */}
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400" > <FaLinkedinIn />
  </a>
  {/* <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-red-500" >
    <FaYoutube />
  </a> */}
          </div>
        </div>
      )}
    </div>
  );
}
