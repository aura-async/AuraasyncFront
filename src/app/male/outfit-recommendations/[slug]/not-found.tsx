'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import GenderNavbar from '../../../../components/GenderNavbar';
import BottomNavigation from '@/components/male/BottomNavigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black text-white">
      <GenderNavbar gender="male" />
      <div className="pt-20 pb-20 px-6 max-w-7xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">404</h1>
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">Category Not Found</h2>
          <p className="text-gray-300 text-lg mb-8">
            The outfit category you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => router.push('/male')}
            className="px-8 py-4 bg-blue-600 rounded-xl text-xl font-bold hover:bg-blue-700 transition-colors mr-4"
          >
            Back to Home
          </button>
          <button
            onClick={() => router.push('/male/recommendations')}
            className="px-8 py-4 bg-gray-600 rounded-xl text-xl font-bold hover:bg-gray-700 transition-colors"
          >
            View All Recommendations
          </button>
        </div>

        <div className="mt-12 p-6 bg-white/10 rounded-xl">
          <h3 className="text-xl font-semibold mb-4">Available Categories</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
            <div 
              className="p-4 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
              onClick={() => router.push('/male/outfit-recommendations/mens-shirts')}
            >
              <h4 className="font-semibold">Men&apos;s Shirts</h4>
              <p className="text-sm text-gray-300">Formal and casual shirts</p>
            </div>
            <div 
              className="p-4 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
              onClick={() => router.push('/male/outfit-recommendations/mens-ethnic-wear')}
            >
              <h4 className="font-semibold">Men&apos;s Ethnic Wear</h4>
              <p className="text-sm text-gray-300">Traditional ethnic clothing</p>
            </div>
            <div 
              className="p-4 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
              onClick={() => router.push('/male/outfit-recommendations/mens-bottomwear')}
            >
              <h4 className="font-semibold">Men&apos;s Bottomwear</h4>
              <p className="text-sm text-gray-300">Pants, jeans, and trousers</p>
            </div>
            <div 
              className="p-4 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
              onClick={() => router.push('/male/outfit-recommendations/mens-tshirts')}
            >
              <h4 className="font-semibold">Men&apos;s T-shirts</h4>
              <p className="text-sm text-gray-300">Casual and printed t-shirts</p>
            </div>
            <div 
              className="p-4 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
              onClick={() => router.push('/male/outfit-recommendations/mens-jackets')}
            >
              <h4 className="font-semibold">Men&apos;s Jackets</h4>
              <p className="text-sm text-gray-300">Blazers and casual jackets</p>
            </div>
          </div>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
}
