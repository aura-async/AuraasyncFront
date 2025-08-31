'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const Navbar = dynamic(() => import('../components/Navbar'), { ssr: false });
const InteractiveCards = dynamic(() => import('../components/InteractiveCards'), { ssr: false });
const FAQ = dynamic(() => import('../components/FAQ'), { ssr: false });
const AuraasyncSlideReveal = dynamic(() => import('../components/AuraasyncSlideReveal'), { ssr: false });

export default function Home() {
  const [showMain, setShowMain] = useState(false);

  useEffect(() => {
    const onDone = () => setShowMain(true);
    window.addEventListener('landingAnimationComplete', onDone);
    // Safety timeout in case event is missed in dev HMR
    const t = setTimeout(() => setShowMain(true), 3500);
    return () => {
      window.removeEventListener('landingAnimationComplete', onDone);
      clearTimeout(t);
    };
  }, []);
  return (
    <div className="min-h-screen bg-black text-white">
      <AuraasyncSlideReveal />
      <Navbar />
      {showMain && (
        <>
          <InteractiveCards />
          <FAQ />
        </>
      )}
    </div>
  );
}
