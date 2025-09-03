"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import HairstyleRecommender from '@/components/male/HairStyleRecommendation';
import { getUserData } from '@/lib/userState';
import BottomNavigation from '@/components/male/BottomNavigation';

export default function HairstylePage() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = getUserData();
    setUserData(data);
    setLoading(false);
    // Require completed face analysis to access hairstyle recommendations
    if (!data?.face_shape) {
      alert('Please complete face analysis first to access hairstyle recommendations');
      router.push('/onboarding');
      return;
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!userData?.face_shape) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Face Analysis Required</h1>
          <p className="mb-6">Please complete face analysis to access hairstyle recommendations</p>
          <button 
            onClick={() => router.push('/onboarding')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Go to Onboarding
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#251F1E] pb-20">
      {/* Navbar for mobile */}
      
      <HairstyleRecommender />
      <BottomNavigation />
    </div>
  );
}
