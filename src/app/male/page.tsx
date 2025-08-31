'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GenderNavbar from '../../components/GenderNavbar';
import FaceAnalysisWidget from '../../components/FaceAnalysisWidget';
import BodyAnalysisWidget from '../../components/BodyAnalysisWidget';
import SkinToneAnalysisWidget from '../../components/SkinToneAnalysisWidget';
import HeroSectionMale from '@/components/HeroSectionMale';
import OutfitRecommendations from '@/components/male/OutfitRecommendations';
import OccasionRecommendations from '@/components/male/OccasionRecommendations';
import MarqueeText from '@/components/male/MarqueeText';
import ProductGrid from '@/components/male/ProductGrid';
import BottomNavigation from '@/components/male/BottomNavigation';
import ExploreProducts from '@/components/male/ExploreProducts';
import Navbar from '@/components/Navbar';

// Analysis steps
const ANALYSIS_STEPS = [
  "Welcome",
  "Face Analysis", 
  "Skin Tone Analysis", 
  "Body Analysis", 
  "Personality Analysis",
  "Recommendations"
];

interface AnalysisResults {
  face_shape?: string;
  skin_tone?: string;
  body_shape?: string;
  personality_type?: string;
  gender: 'Male';
}

interface Product {
  title: string;
  price: string;
  image: string;
  link: string;
  description?: string;
}

// Hero Section Component - Adapted for male users
const Hero = () => {
  return (
   <>
   <GenderNavbar gender='male'/>
      <HeroSectionMale/>
      <OutfitRecommendations/>
      <OccasionRecommendations/>
      <MarqueeText/>
      <ExploreProducts gender="men"/>
   </>
  );
};

// Main Male Page Component with Analysis Logic
const MaleHome = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [results, setResults] = useState<AnalysisResults>({ gender: 'Male' });
  const [skipped, setSkipped] = useState<{ face: boolean; body: boolean; personality: boolean; skin_tone: boolean }>({ 
    face: false, body: false, personality: false, skin_tone: false 
  });
  const [completed, setCompleted] = useState<string[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [recommendationsLoaded, setRecommendationsLoaded] = useState(false);

  const canShowRecommendations = completed.length >= 2;

  // Onboarding gate and immediate recommendations view
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('auraasync_user_data') || '{}');
    if (!userData || !userData.onboarding_completed) {
      window.location.href = '/onboarding';
      return;
    }
    // Show recommendations immediately when onboarding is completed
    setShowRecommendations(true);
    if (!recommendationsLoaded) {
      fetchRecommendations();
      setRecommendationsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (currentStep >= ANALYSIS_STEPS.length - 1 && canShowRecommendations) {
      setShowRecommendations(true);
      fetchRecommendations();
    }
  }, [currentStep, canShowRecommendations]);

  // Auto-fetch recommendations when user data is available
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('auraasync_user_data') || '{}');
    if (userData && userData.onboarding_completed && userData.gender === 'male' && !recommendationsLoaded) {
      fetchRecommendations();
      setRecommendationsLoaded(true);
    }
  }, [recommendationsLoaded]);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const userData = JSON.parse(localStorage.getItem('auraasync_user_data') || '{}');
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API}/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body_shape: userData.body_shape || results.body_shape || 'Rectangle',
          personality_type: userData.personality || results.personality_type || 'ISTJ',
          skin_tone: userData.skin_tone || results.skin_tone || 'Warm',
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      
      const data = await response.json();
      setSearchQuery(data.query);
      setProducts(data.products || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch recommendations');
      setLoading(false);
    }
  };

  const handleComplete = (type: 'face' | 'skin_tone' | 'body' | 'personality', value: string) => {
    setResults(prev => ({ ...prev, [type === 'face' ? 'face_shape' : type === 'body' ? 'body_shape' : type === 'personality' ? 'personality_type' : 'skin_tone']: value }));
    setCompleted(prev => Array.from(new Set([...prev, type])));
    setCurrentStep(prev => prev + 1);
  };

  const handleSkip = (type: 'face' | 'skin_tone' | 'body' | 'personality') => {
    setSkipped(prev => ({ ...prev, [type]: true }));
    setCurrentStep(prev => prev + 1);
  };

  const handleStartAnalysis = () => {
    setCurrentStep(1);
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setResults({ gender: 'Male' });
    setSkipped({ face: false, body: false, personality: false, skin_tone: false });
    setCompleted([]);
    setShowRecommendations(false);
    setProducts([]);
    setLoading(false);
    setError(null);
    setSearchQuery(null);
  };

  // Welcome Step with Hero UI
  if (currentStep === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black text-white">
        <Hero />
        
        {/* Analysis Start Button */}
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-30">
          {/* <button
            onClick={handleStartAnalysis}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-12 py-4 rounded-xl text-2xl font-bold hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-2xl"
          >
            Start Your Style Analysis
          </button> */}
        </div>
      </div>
    );
  }

  // Recommendations Step
  if (showRecommendations) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black text-white p-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-8 text-center">Your Personalized Recommendations</h1>
            
            {loading && (
              <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-full max-w-2xl mx-auto mb-8 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
                <p className="text-xl">Searching Amazon for personalized fashion recommendations...</p>
                <p className="text-sm text-gray-300 mt-2">This may take a few moments</p>
              </div>
            )}
            
            {error && (
              <div className="bg-red-900/50 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-full max-w-2xl mx-auto mb-8">
                <h2 className="text-2xl font-bold mb-2 text-red-200">Error</h2>
                <p className="text-red-300">{error}</p>
                <button
                  onClick={fetchRecommendations}
                  className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
            
            {searchQuery && (
              <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-xl w-full max-w-2xl mx-auto mb-8">
                <h2 className="text-2xl font-bold mb-2">Search Query</h2>
                <p className="text-gray-300 text-sm mb-2">Based on your preferences, we searched for:</p>
                <p className="bg-gray-800 p-4 rounded-lg text-yellow-300 font-mono text-sm break-words">{searchQuery}</p>
              </div>
            )}
            
            {products.length > 0 && (
              <div className="w-full">
                <h2 className="text-3xl font-bold mb-6 text-center">Recommended Products</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product, idx) => (
                    <motion.a
                      key={idx}
                      href={product.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white rounded-2xl shadow-2xl p-6 flex flex-col items-center transition-all hover:scale-105 hover:shadow-3xl duration-200"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <img 
                        src={product.image} 
                        alt={product.title || "Product"} 
                        className="rounded-xl mb-4 max-h-48 object-contain w-full" 
                      />
                      <div className="text-lg font-bold text-blue-700 mb-2 uppercase tracking-wide">FASHION</div>
                      <div className="text-lg font-bold text-gray-900 mb-2 text-center line-clamp-2">{product.title || "Fashion Pick"}</div>
                      <div className="text-xl font-semibold text-green-600 mb-2">{product.price || "Price N/A"}</div>
                      {product.description && (
                        <div className="text-sm text-gray-600 mb-4 line-clamp-3">{product.description}</div>
                      )}
                      <span className="w-full mt-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-lg hover:from-blue-600 hover:to-purple-600 transition text-lg shadow flex items-center justify-center gap-2">
                        View on Amazon
                      </span>
                    </motion.a>
                  ))}
                </div>
              </div>
            )}
            
            {products.length === 0 && !loading && !error && (
              <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-full max-w-2xl mx-auto mb-8">
                <h2 className="text-2xl font-bold mb-2">No Products Found</h2>
                <p className="text-gray-300">We couldn&apos;t find any products matching your preferences. Try adjusting your selections or check back later.</p>
              </div>
            )}
            
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={handleRestart}
                className="px-8 py-4 bg-gray-600 rounded-xl text-xl font-bold hover:bg-gray-700 transition-colors"
              >
                Start Over
              </button>
              <button
                onClick={handleBack}
                className="px-8 py-4 bg-blue-600 rounded-xl text-xl font-bold hover:bg-blue-700 transition-colors"
              >
                Back to Analysis
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Analysis Steps
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Step {currentStep} of {ANALYSIS_STEPS.length - 1}</h2>
            <span className="text-gray-300">{ANALYSIS_STEPS[currentStep]}</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / (ANALYSIS_STEPS.length - 1)) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Analysis Components */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 1 && (
              <FaceAnalysisWidget
                onComplete={(result) => handleComplete('face', result.face_shape || 'Unknown')}
              />
            )}

            {currentStep === 2 && (
              <SkinToneAnalysisWidget
                onComplete={(result) => handleComplete('skin_tone', result)}
                onSkip={() => handleSkip('skin_tone')}
              />
            )}

            {currentStep === 3 && (
              <BodyAnalysisWidget
                onComplete={(result) => handleComplete('body', result.body_shape || 'Unknown')}
              />
            )}

            {currentStep === 4 && null}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handleBack}
            disabled={currentStep <= 1}
            className="px-6 py-3 bg-gray-600 rounded-lg text-white font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          
          <button
            onClick={handleRestart}
            className="px-6 py-3 bg-red-600 rounded-lg text-white font-semibold hover:bg-red-700 transition-colors"
          >
            Start Over
          </button>
        </div>
      </div>
    </div>
  );
};

export default function MaleLanding() {
  return (
    <div className="min-h-screen bg-black">
      {/* Navbar for mobile */}
      <Navbar 
        items={[
          { icon: <span>🏠</span>, label: "Home", onClick: () => window.location.href = '/male' },
          { icon: <span>🔍</span>, label: "Search", onClick: () => window.location.href = '/search' },
          { icon: <span>💇</span>, label: "Hairstyle", onClick: () => window.location.href = '/hairstyle' },
          { icon: <span>⚙️</span>, label: "Dashboard", onClick: () => window.location.href = '/dashboard' },
        ]}
      />
 
        <MaleHome />

      <BottomNavigation />
    </div>
  );
}


