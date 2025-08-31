'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getUserData, clearUserData } from '../lib/userState';

interface GenderNavbarProps {
  gender: 'male' | 'female';
}

export default function GenderNavbar({ gender }: GenderNavbarProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const userData = getUserData();

  const handleLogout = () => {
    clearUserData();
    router.push('/');
  };

  const isFaceAnalysisCompleted = userData?.face_shape;

  return (
    <nav className="bg-black/90 backdrop-blur-lg border-b border-white/10 fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={`/${gender}`} className="flex items-center space-x-2">
            <span className="text-white text-xl font-bold">AuraSync</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href={`/${gender}`}
              className="text-white hover:text-blue-400 transition-colors flex items-center space-x-2"
            >
              <span>🏠</span>
              <span>Home</span>
            </Link>
            
            <Link 
              href="/dashboard"
              className="text-white hover:text-blue-400 transition-colors flex items-center space-x-2"
            >
              <span>📊</span>
              <span>Dashboard</span>
            </Link>
            
            <Link 
              href={isFaceAnalysisCompleted ? "/hairstyle" : "#"}
              className={`transition-colors flex items-center space-x-2 ${
                isFaceAnalysisCompleted 
                  ? 'text-white hover:text-blue-400' 
                  : 'text-gray-500 cursor-not-allowed'
              }`}
              onClick={(e) => {
                if (!isFaceAnalysisCompleted) {
                  e.preventDefault();
                  alert('Complete face analysis to unlock hairstyle recommendations');
                }
              }}
            >
              <span>💇</span>
              <span>Hairstyle</span>
              {!isFaceAnalysisCompleted && <span className="text-xs text-red-400">(Locked)</span>}
            </Link>
            
            <Link 
              href="/search"
              className="text-white hover:text-blue-400 transition-colors flex items-center space-x-2"
            >
              <span>🔍</span>
              <span>Search</span>
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-white">
              <span>👤</span>
              <span className="text-sm">{userData?.name || 'User'}</span>
            </div>
            
            <button
              onClick={handleLogout}
              className="text-white hover:text-red-400 transition-colors text-sm"
            >
              Logout
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white hover:text-blue-400 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-white/10">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link 
                href={`/${gender}`}
                className="block px-3 py-2 text-white hover:text-blue-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                🏠 Home
              </Link>
              
              <Link 
                href="/dashboard"
                className="block px-3 py-2 text-white hover:text-blue-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                📊 Dashboard
              </Link>
              
              <Link 
                href={isFaceAnalysisCompleted ? "/hairstyle" : "#"}
                className={`block px-3 py-2 transition-colors ${
                  isFaceAnalysisCompleted 
                    ? 'text-white hover:text-blue-400' 
                    : 'text-gray-500 cursor-not-allowed'
                }`}
                onClick={(e) => {
                  if (!isFaceAnalysisCompleted) {
                    e.preventDefault();
                    alert('Complete face analysis to unlock hairstyle recommendations');
                  } else {
                    setIsMenuOpen(false);
                  }
                }}
              >
                💇 Hairstyle {!isFaceAnalysisCompleted && '(Locked)'}
              </Link>
              
              <Link 
                href="/search"
                className="block px-3 py-2 text-white hover:text-blue-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                🔍 Search
              </Link>
              
              <div className="border-t border-white/10 pt-2 mt-2">
                <div className="px-3 py-2 text-white text-sm">
                  👤 {userData?.name || 'User'}
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-white hover:text-red-400 transition-colors text-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
