"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

const cards = [
  {
    title: "Body Type Analysis",
    description:
      "Discover your unique body type and get personalized style recommendations to enhance your natural silhouette.",
    href: "/body-analysis",
  },
  {
    title: "Skin Tone Analysis",
    description:
      "Find the colors that complement your skin tone for a wardrobe that makes you glow every day.",
    href: "/skin-analysis",
  },
  {
    title: "Personality Analysis",
    description:
      "Express your individuality with fashion choices tailored to your personality and lifestyle.",
    href: "/personality-analysis",
  },
];

export default function Section2() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const sectionTop = sectionRef.current.getBoundingClientRect().top + window.scrollY;
      const sectionHeight = sectionRef.current.offsetHeight;
      const scrollY = window.scrollY + window.innerHeight / 2;
      // Set the scrollable range to 100vh (like hero section)
      const scrollRange = window.innerHeight;
      const relScroll = Math.max(0, Math.min(scrollY - sectionTop, scrollRange));
      const cardHeight = scrollRange / cards.length;
      const idx = Math.min(cards.length - 1, Math.floor(relScroll / cardHeight));
      setActiveIndex(idx);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Card vertical offsets for stacking
  const offsets = [0, 60, 120];
  // Card tilts for stacking
  const tilts = [2, -2, 2];

  return (
    <section ref={sectionRef} className="relative w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-800 py-32">
      <div className="relative w-full flex flex-col items-center justify-center" style={{height: '70vh'}}>
        {cards.map((card, i) => {
          // Animation logic
          const isActive = i === activeIndex;
          const isPrev = i < activeIndex;
          let z = 10 - i;
          let opacity = isActive ? 1 : 0.7;
          let scale = isActive ? 1 : 0.96;
          let rotate = isActive ? 0 : tilts[i];
          let translateY = isActive ? 0 : offsets[i] + (isPrev ? -40 : 0);
          if (isPrev) opacity = 0.3;
          return (
            <Link
              key={card.title}
              href={card.href}
              className={`absolute left-1/2 top-0 transition-all duration-700 ease-in-out flex flex-col justify-center items-center px-6 py-10 md:px-16 md:py-16 rounded-3xl shadow-2xl backdrop-blur-lg border border-white/10 bg-white/10 focus:outline-none focus:ring-4 focus:ring-yellow-200 cursor-pointer`}
              style={{
                zIndex: z,
                width: '80vw',
                maxWidth: '700px',
                height: '60vh',
                minHeight: '340px',
                opacity,
                transform: `translate(-50%, ${translateY}px) rotate(${rotate}deg) scale(${scale})`,
                boxShadow: isActive
                  ? "0 30px 60px rgba(0,0,0,0.25)"
                  : "0 20px 40px rgba(0,0,0,0.15)",
                transitionProperty: "opacity, transform, box-shadow",
                pointerEvents: opacity > 0.5 ? 'auto' : 'none',
              }}
              tabIndex={0}
            >
              <div className="text-lg font-semibold opacity-50 mb-2 self-start">{`0${i + 1}`}</div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-white text-center w-full">
                {card.title}
              </h2>
              <p className="text-base md:text-lg text-white/90 max-w-2xl text-center">
                {card.description}
              </p>
            </Link>
          );
        })}
      </div>
      <div className="scroll-indicator fixed bottom-8 left-1/2 -translate-x-1/2 text-white text-base opacity-70 animate-bounce z-50">
        Scroll to explore ↓
      </div>
      <div className="fixed right-12 bottom-24 z-50">
        <Link href="/analysis-v2/force">
          <button
            className="px-8 py-4 text-2xl font-bold rounded-2xl shadow-lg bg-gradient-to-r from-pink-500 to-yellow-400 text-black hover:scale-105 transition-all duration-300"
            style={{ fontSize: '1.5rem', minWidth: '260px' }}
          >
            Start Your Analysis
          </button>
        </Link>
      </div>
    </section>
  );
} 