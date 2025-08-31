'use client';

import React from 'react';
import Image from 'next/image';
import { Outfit } from 'next/font/google';
import { FiArrowRight } from 'react-icons/fi';

const outfit = Outfit({ subsets: ['latin'], weight: ['400', '700'] });

const SellerPage = () => {
  return (
    <div className="relative w-full min-h-[70vh] flex flex-col items-center justify-center text-white p-8 overflow-hidden">
      {/* Background Container */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/1.png"
          alt="Seller background"
          fill
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center flex flex-col items-center">
        <h2 className={`${outfit.className} text-5xl md:text-7xl font-bold leading-tight uppercase text-transparent [-webkit-text-stroke:1px_white] [text-stroke:1px_white]`}>
          Curated Style -<br /> Targeted Reach
        </h2>
        <p className="mt-6 mb-8 text-lg max-w-lg">
          Register as a seller at Auraasync and find your perfect customers.
        </p>
        <button className="bg-white text-black font-bold py-4 px-8 rounded-full flex items-center space-x-2 hover:bg-gray-200 transition-colors">
          <span>SELL WITH US</span>
          <FiArrowRight />
        </button>
      </div>


    </div>
  );
};

export default SellerPage; 