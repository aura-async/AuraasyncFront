'use client';

import React from 'react';
import FaceAnalysisWidget from '@/components/FaceAnalysisWidget';
import { auth } from '@/lib/firebase';
import axios from 'axios';
import { getUserData, updateUserData } from '@/lib/userState';
import { useRouter } from 'next/navigation';

export default function FaceAnalysisPage() {
  const router = useRouter();

  const handleComplete = async (payload: { face_shape?: string }) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        router.replace('/login');
        return;
      }
      const idToken = await currentUser.getIdToken();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

      // Merge with existing user data to avoid overwriting other fields
      const existing = getUserData();
      const body = {
        name: existing?.name,
        gender: existing?.gender,
        location: existing?.location || 'Mumbai',
        skin_tone: existing?.skin_tone,
        face_shape: payload.face_shape,
        body_shape: existing?.body_shape || null,
        personality: existing?.personality || null,
      };

      await axios.put(`${API_URL}/auth/update-onboarding`, body, {
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      });

      updateUserData({ face_shape: payload.face_shape || null });
      router.replace('/dashboard');
    } catch (err) {
      console.error('Failed to save face analysis', err);
      router.replace('/dashboard');
    }
  };

  return <FaceAnalysisWidget onComplete={handleComplete} />;
}


