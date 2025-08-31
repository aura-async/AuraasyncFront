'use client';

import React from 'react';
import { FiPhone } from 'react-icons/fi';

interface SellerSectionProps {
  isVisible?: boolean;
  onClose?: () => void;
}

const SellerSection = ({ isVisible, onClose }: SellerSectionProps) => (
  // Only render the desktop view, which is hidden on mobile and tablet and visible on lg screens and up
    <section
      className="hidden lg:block w-full h-screen min-h-[400px] bg-center bg-no-repeat relative"
      style={{
        backgroundImage: 'url(/Seller-bg.png)',
        backgroundSize: 'cover',
        width: '100vw',
        height: '100vh',
        minHeight: '400px',
        margin: '0 auto',
      }}
    >
      <div className="absolute left-1/2 -translate-x-1/2 bottom-8 md:static md:translate-x-0 md:absolute md:bottom-24 md:left-16 flex space-x-4 w-full md:w-auto justify-center md:justify-start">
        <button className="bg-black text-white font-bold px-8 py-3 rounded-xl shadow hover:bg-gray-900 transition-all text-base">
          Register as seller
        </button>
        <button className="bg-[#23231f] text-white p-3 rounded-xl shadow flex items-center justify-center text-2xl">
          <FiPhone />
        </button>
      </div>
    </section>
);

export default SellerSection; 