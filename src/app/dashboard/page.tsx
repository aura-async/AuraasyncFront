'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import BottomNavigation from '@/components/male/BottomNavigation';
import { auth } from '../../lib/firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';
import { getUserData, clearUserData } from '@/lib/userState';


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
      
      console.log('Attempting to fetch user data from:', `${API_URL}/auth/me`);
      
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
              });

      console.log('API Response:', response.data);

      if (response.status === 200) {
        setUserData(response.data);
      } else {
        setError('Failed to fetch user data');
      }
    } catch (error: any) {
      console.error('Error fetching user data:', error);
      
      // Try to get data from localStorage as fallback
      const localUserData = getUserData();
      if (localUserData && localUserData.onboarding_completed) {
        console.log('Using localStorage data as fallback:', localUserData);
        setUserData({
          id: 1,
          email: localUserData.email || '',
          name: localUserData.name || '',
          gender: localUserData.gender || '',
          location: localUserData.location || '',
          skin_tone: localUserData.skin_tone || '',
          face_shape: localUserData.face_shape || null,
          body_shape: localUserData.body_shape || null,
          personality: localUserData.personality || null,
          onboarding_completed: localUserData.onboarding_completed || false,
          is_new_user: false
        });
        return;
      }
      
      if (error.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else if (error.response?.status === 404) {
        setError('User not found in database');
      } else {
        setError(`Failed to fetch user data: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Wait for Firebase auth state, then fetch
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (!fbUser) {
        setError('No authenticated user found');
        setIsLoading(false);
        return;
      }
      fetchUserData();
    });
    return () => unsubscribe();
  }, []);

  // Redirect if no user data and not loading
  React.useEffect(() => {
    if (!isLoading && !userData && !error) {
      router.push('/');
    }
  }, [userData, isLoading, error, router]);

 const handleLogout = async () => {
    clearUserData();
     await signOut(auth);
    router.push('/');
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
    <div className="min-h-screen bg-[#251F1E] text-white p-8 pb-20">
      
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
                <div className="flex items-center gap-3">
                  <span className={`font-medium ${userData.skin_tone ? 'text-green-400' : 'text-red-400'}`}>
                    {userData.skin_tone || 'Not completed'}
                  </span>
                  <button onClick={() => router.push('/onboarding?mode=single&target=skin')} className="text-xs px-2 py-1 rounded bg-blue-600 hover:bg-blue-700">Redo</button>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Face Shape:</span>
                <div className="flex items-center gap-3">
                  <span className={`font-medium ${userData.face_shape ? 'text-green-400' : 'text-red-400'}`}>
                    {userData.face_shape || 'Not completed'}
                  </span>
                  <button onClick={() => router.push('/onboarding?mode=single&target=face')} className="text-xs px-2 py-1 rounded bg-blue-600 hover:bg-blue-700">Redo</button>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Body Shape:</span>
                <div className="flex items-center gap-3">
                  <span className={`font-medium ${userData.body_shape ? 'text-green-400' : 'text-red-400'}`}>
                    {userData.body_shape || 'Not completed'}
                  </span>
                  <button onClick={() => router.push('/onboarding?mode=single&target=body')} className="text-xs px-2 py-1 rounded bg-blue-600 hover:bg-blue-700">Redo</button>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Personality:</span>
                <div className="flex items-center gap-3">
                  <span className={`font-medium ${userData.personality ? 'text-green-400' : 'text-red-400'}`}>
                    {userData.personality || 'Not completed'}
                  </span>
                  <button onClick={() => router.push('/onboarding?mode=single&target=personality')} className="text-xs px-2 py-1 rounded bg-blue-600 hover:bg-blue-700">Redo</button>
                </div>
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
                className="w-full bg-white/10 border border-white/30 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                 Go to Homepage
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

        {/* Debug Information */}
        <div className="mt-8 bg-yellow-500/10 backdrop-blur-lg rounded-xl p-6 border border-yellow-500/30">
          <h2 className="text-2xl font-semibold mb-4 flex items-center text-yellow-400">
            <span className="mr-2">🐛</span>
            Debug Information
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">API Status:</span>
              <span className="font-medium text-blue-400">Check Console for Details</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">LocalStorage Data:</span>
              <button 
                onClick={() => {
                  const localData = getUserData();
                  console.log('LocalStorage User Data:', localData);
                  alert(`LocalStorage Data: ${JSON.stringify(localData, null, 2)}`);
                }}
                className="text-xs px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white"
              >
                View Data
              </button>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Backend URL:</span>
              <span className="font-medium text-green-400">
                {process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}
              </span>
            </div>
            <div className="mt-4 p-3 bg-black/20 rounded-lg">
              <p className="text-xs text-gray-400">
                💡 <strong>Tip:</strong> If the dashboard shows no data, check the browser console for API errors. 
                The system will automatically use localStorage data as a fallback if the API fails.
              </p>
            </div>
          </div>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
}
