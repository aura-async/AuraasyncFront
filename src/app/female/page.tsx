'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GenderNavbar from '../../components/GenderNavbar';
import FaceAnalysisWidget from '../../components/FaceAnalysisWidget';
import BodyAnalysisWidget from '../../components/BodyAnalysisWidget';
import SkinToneAnalysisWidget from '../../components/SkinToneAnalysisWidget';
import HeroFemale from '@/components/female/HeroFemale';
import OutfitRecommendations from '@/components/female/OutfitRecommendations';
import OccasionRecommendations from '@/components/female/OccasionRecommendation';
import MarqueeText from '@/components/female/MarqueeText';
import ProductGrid from '@/components/female/ProductGrid';
import BottomNavigation from '@/components/female/BottomNavigation';
import ExploreProducts from '@/components/female/ExploreProducts';
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
  gender: 'Female';
}

interface Product {
  title: string;
  price: string;
  image: string;
  link: string;
  description?: string;
}

// Hero Section Component - Exact match to the image
const Hero = () => {
  return (
    <section className="min-h-screen relative overflow-hidden">
      <GenderNavbar gender="female" />
      <HeroFemale/>
    </section>
  );
};

// Main Female Page Component with Analysis Logic
const FemaleHome = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [results, setResults] = useState<AnalysisResults>({ gender: 'Female' });
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
    if (userData && userData.onboarding_completed && userData.gender === 'female' && !recommendationsLoaded) {
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
          body_shape: userData.body_shape || results.body_shape || 'Hourglass',
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
    setResults({ gender: 'Female' });
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
      <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-black text-white">
        <Hero />
        
        {/* Analysis Start Button */}
        
      </div>
    );
  }

  // Recommendations Step
  if (showRecommendations) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-black text-white p-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-8 text-center">Your Personalized Recommendations</h1>
            
            {loading && (
              <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-full max-w-2xl mx-auto mb-8 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-400 mx-auto mb-4"></div>
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
                      <div className="text-lg font-bold text-pink-700 mb-2 uppercase tracking-wide">FASHION</div>
                      <div className="text-lg font-bold text-gray-900 mb-2 text-center line-clamp-2">{product.title || "Fashion Pick"}</div>
                      <div className="text-xl font-semibold text-green-600 mb-2">{product.price || "Price N/A"}</div>
                      {product.description && (
                        <div className="text-sm text-gray-600 mb-4 line-clamp-3">{product.description}</div>
                      )}
                      <span className="w-full mt-auto px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-lg hover:from-pink-600 hover:to-purple-600 transition text-lg shadow flex items-center justify-center gap-2">
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
                className="px-8 py-4 bg-pink-600 rounded-xl text-xl font-bold hover:bg-pink-700 transition-colors"
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
    <div className="min-h-screen bg-[#1a1414]">
      
      
      {!showRecommendations ? (
        <div className="pt-20 pb-20 px-6 max-w-7xl mx-auto">
          {/* Analysis Steps */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {ANALYSIS_STEPS[currentStep]}
            </h1>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / ANALYSIS_STEPS.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Analysis Widgets */}
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <h2 className="text-2xl font-bold text-white mb-4">Welcome to AuraaSync</h2>
                <p className="text-gray-300 mb-6">Let's analyze your style preferences to provide personalized recommendations.</p>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start Analysis
                </button>
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div
                key="face"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <FaceAnalysisWidget
                  onComplete={(value) => handleComplete('face', value)}
                  onSkip={() => {
                    setSkipped(prev => ({ ...prev, face: true }));
                    setCurrentStep(prev => prev + 1);
                  }}
                />
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="skin"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <SkinToneAnalysisWidget
                  onComplete={(value) => handleComplete('skin_tone', value)}
                  onSkip={() => {
                    setSkipped(prev => ({ ...prev, skin_tone: true }));
                    setCurrentStep(prev => prev + 1);
                  }}
                />
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="body"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <BodyAnalysisWidget
                  onComplete={(value) => handleComplete('body', value)}
                  onSkip={() => {
                    setSkipped(prev => ({ ...prev, body: true }));
                    setCurrentStep(prev => prev + 1);
                  }}
                />
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div
                key="personality"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <h2 className="text-2xl font-bold text-white mb-4">Personality Analysis</h2>
                <p className="text-gray-300 mb-6">This helps us understand your style preferences better.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  {['ISTJ', 'ISFJ', 'INFJ', 'INTJ', 'ISTP', 'ISFP', 'INFP', 'INTP', 'ESTP', 'ESFP', 'ENFP', 'ENTP', 'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'].map((type) => (
                    <button
                      key={type}
                      onClick={() => handleComplete('personality', type)}
                      className="p-4 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      {type}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setSkipped(prev => ({ ...prev, personality: true }));
                    setCurrentStep(prev => prev + 1);
                  }}
                  className="mt-4 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Skip
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <>
          <Hero />
          <OutfitRecommendations />
          <OccasionRecommendations />
          <MarqueeText />
          <ExploreProducts gender="women" />
        </>
      )}
      
      <BottomNavigation />
    </div>
  );
};

export default function FemaleLanding() {
  return (
    <div className="min-h-screen bg-black">
      {/* Navbar for mobile */}
      <Navbar 
        items={[
          { icon: <span>🏠</span>, label: "Home", onClick: () => window.location.href = '/female' },
          { icon: <span>🔍</span>, label: "Search", onClick: () => window.location.href = '/search' },
          { icon: <span>💇</span>, label: "Hairstyle", onClick: () => window.location.href = '/hairstyle' },
          { icon: <span>⚙️</span>, label: "Dashboard", onClick: () => window.location.href = '/dashboard' },
        ]}
      />
    
      
         <FemaleHome />
        <OutfitRecommendations/>
        <OccasionRecommendations/>
        <MarqueeText/>
        <ExploreProducts gender="women"/>
       <BottomNavigation/>
    </div>
  );
}


