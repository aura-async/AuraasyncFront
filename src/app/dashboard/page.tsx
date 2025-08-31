'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import BottomNavigation from '@/components/male/BottomNavigation';
import Navbar from '@/components/Navbar';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import axios from 'axios';

interface UserData {
  id: number;
  email: string;
  name: string;
  gender: 'male' | 'female' | '';
  location: string;
  skin_tone?: string;
  face_shape?: string | null;
  body_shape?: string | null;
  personality?: string | null;
  onboarding_completed: boolean;
  is_new_user: boolean;
  profile_picture?: string;
}

export default function Dashboard() {
  const [userData, setUserData] = React.useState<UserData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();

  // Fetch user data from backend
  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setError('No authenticated user found');
        setIsLoading(false);
        return;
      }

      const idToken = await currentUser.getIdToken();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        setUserData(response.data);
      } else {
        setError('Failed to fetch user data');
      }
    } catch (error: any) {
      console.error('Error fetching user data:', error);
      if (error.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else if (error.response?.status === 404) {
        setError('User not found in database');
      } else {
        setError('Failed to fetch user data. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user data on component mount
  React.useEffect(() => {
    fetchUserData();
  }, []);

  // Redirect if no user data and not loading
  React.useEffect(() => {
    if (!isLoading && !userData && !error) {
      router.push('/');
    }
  }, [userData, isLoading, error, router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
      router.push('/');
    }
  };

  const handleRefresh = () => {
    fetchUserData();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-center max-w-md mx-auto p-6">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4">Error Loading Dashboard</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={handleRefresh}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all"
            >
              🔄 Try Again
            </button>
            <button
              onClick={handleLogout}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-all"
            >
              🚪 Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white">No user data available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white p-8 pb-20">
      {/* Navbar for mobile */}
      <Navbar 
        items={[
          { icon: <span>🏠</span>, label: "Home", onClick: () => router.push(`/${userData.gender}`) },
          { icon: <span>🔍</span>, label: "Search", onClick: () => router.push('/search') },
          { icon: <span>💇</span>, label: "Hairstyle", onClick: () => userData.face_shape ? router.push('/hairstyle') : null },
          { icon: <span>⚙️</span>, label: "Settings", onClick: () => router.push('/dashboard') },
        ]}
      />
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">User Dashboard</h1>
          <p className="text-gray-300">Your personalized fashion profile</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Basic Information */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <span className="mr-2">👤</span>
              Basic Information
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Name:</span>
                <span className="font-medium">{userData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Email:</span>
                <span className="font-medium">{userData.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Gender:</span>
                <span className="font-medium capitalize">{userData.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Location:</span>
                <span className="font-medium">{userData.location}</span>
              </div>
            </div>
          </div>

          {/* Analysis Results */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <span className="mr-2">🔬</span>
              Analysis Results
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Skin Tone:</span>
                <span className={`font-medium ${userData.skin_tone ? 'text-green-400' : 'text-red-400'}`}>
                  {userData.skin_tone || 'Not completed'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Face Shape:</span>
                <span className={`font-medium ${userData.face_shape ? 'text-green-400' : 'text-red-400'}`}>
                  {userData.face_shape || 'Not completed'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Body Shape:</span>
                <span className={`font-medium ${userData.body_shape ? 'text-green-400' : 'text-red-400'}`}>
                  {userData.body_shape || 'Not completed'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Personality:</span>
                <span className={`font-medium ${userData.personality ? 'text-green-400' : 'text-red-400'}`}>
                  {userData.personality || 'Not completed'}
                </span>
              </div>
            </div>
          </div>

          {/* Onboarding Status */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <span className="mr-2">✅</span>
              Onboarding Status
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Profile Complete:</span>
                <span className={`font-medium ${userData.onboarding_completed ? 'text-green-400' : 'text-yellow-400'}`}>
                  {userData.onboarding_completed ? 'Yes' : 'In Progress'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Hairstyle Access:</span>
                <span className={`font-medium ${userData.face_shape ? 'text-green-400' : 'text-red-400'}`}>
                  {userData.face_shape ? 'Unlocked' : 'Locked'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <span className="mr-2">⚡</span>
              Quick Actions
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => router.push(`/${userData.gender}`)}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                🏠 Go to Homepage
              </button>
              <button
                onClick={() => router.push('/search')}
                className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-teal-700 transition-all"
              >
                🔍 Search Products
              </button>
              {userData.face_shape && (
                <button
                  onClick={() => router.push('/hairstyle')}
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-600 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-rose-700 transition-all"
                >
                  💇 Hairstyle Recommendations
                </button>
              )}
              <button
                onClick={handleLogout}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>

        {/* Analysis Completion Progress */}
        <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-xl p-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <span className="mr-2">📊</span>
            Analysis Completion
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Profile Completion</span>
              <span>{userData.onboarding_completed ? '100%' : '75%'}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: userData.onboarding_completed ? '100%' : '75%' }}
              ></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className={`text-center p-3 rounded-lg ${userData.skin_tone ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                Skin Tone
              </div>
              <div className={`text-center p-3 rounded-lg ${userData.face_shape ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                Face Shape
              </div>
              <div className={`text-center p-3 rounded-lg ${userData.body_shape ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                Body Shape
              </div>
              <div className={`text-center p-3 rounded-lg ${userData.personality ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                Personality
              </div>
            </div>
          </div>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
}
