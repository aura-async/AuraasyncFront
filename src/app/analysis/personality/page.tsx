'use client';

import React from 'react';
import PersonalityAnalysisWidget from '@/components/PersonalityAnalysisWidget';
import { auth } from '@/lib/firebase';
import axios from 'axios';
import { getUserData, updateUserData } from '@/lib/userState';
import { useRouter } from 'next/navigation';

export default function PersonalityAnalysisPage() {
  const router = useRouter();

  const handleComplete = async (mbti: string) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        router.replace('/login');
        return;
      }
      const idToken = await currentUser.getIdToken();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

      const existing = getUserData();
      const body = {
        name: existing?.name,
        gender: existing?.gender,
        location: existing?.location || 'Mumbai',
        skin_tone: existing?.skin_tone || null,
        face_shape: existing?.face_shape || null,
        body_shape: existing?.body_shape || null,
        personality: mbti,
      };

      await axios.put(`${API_URL}/auth/update-onboarding`, body, {
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      });

      updateUserData({ personality: mbti });
      router.replace('/dashboard');
    } catch (err) {
      console.error('Failed to save personality analysis', err);
      router.replace('/dashboard');
    }
  };

  return <PersonalityAnalysisWidget onComplete={handleComplete} />;
}


