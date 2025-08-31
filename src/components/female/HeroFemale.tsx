'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import heroDesktop from "@/app/assets/female/hero women.png";
import heroMobile from "@/app/assets/female/HeroMoblie.png";

const HeroFemale = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Function to check screen size
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // mobile breakpoint
    };

    // Initial check
    handleResize();

    // Listen for resize
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section className="min-h-screen hero-gradient relative overflow-hidden">
      {/* Full Screen Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={isMobile ? heroMobile : heroDesktop}
          alt="AI-powered virtual try-on with digital mirror and styling interface"
          className="w-full h-full object-cover"
          priority
        />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-left space-y-6 z-10">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight drop-shadow-lg">
                Stop fighting your wardrobe{" "}
                <span className="block">Start flexing it</span>
              </h1>
              <p className="text-xl md:text-2xl text-white/90 font-medium drop-shadow-lg">
                Auraasync finds what really works for you
              </p>
            </div>

            {/* Right Side - Interactive Elements */}
            {!isMobile && (
              <div className="relative z-10 flex justify-center lg:justify-end">
                <div className="relative max-w-md">
                  {/* Face Outline */}
                  <div className="absolute top-4 right-4 w-8 h-8 border-2 border-white rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 border border-white rounded-full"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Background Decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-white rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-pink-500 to-cyan-500 rounded-full blur-3xl opacity-40"></div>
      </div>
    </section>
  );
};

export default HeroFemale;
