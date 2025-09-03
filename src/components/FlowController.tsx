'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getUserData, shouldShowGuestUI, shouldShowOnboarding, shouldShowGenderHomepage, getRedirectPath } from '../lib/userState';

interface FlowControllerProps {
  children: React.ReactNode;
}

export default function FlowController({ children }: FlowControllerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    const checkUserFlow = () => {
      const userData = getUserData();
      const currentPath = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);
      const isSingleAnalysis = currentPath === '/onboarding' && searchParams.get('mode') === 'single';

      // Landing page (guest UI): if authenticated and done, skip to gender homepage
      if (currentPath === '/') {
        if (userData && userData.onboarding_completed) {
          const redirectPath = userData.gender === 'male' ? '/male' : '/female';
          setIsLoading(false);
          router.replace(redirectPath);
          return;
        } else if (userData && !userData.onboarding_completed) {
          setIsLoading(false);
          router.replace('/onboarding');
          return;
        }
        // guest stays on /
      }

      // Onboarding: allow guests and incomplete users; skip if already completed
      if (currentPath === '/onboarding') {
        // Allow onboarding even with no user data. Only redirect if it's already completed.
        if (!isSingleAnalysis && userData && userData.onboarding_completed) {
          const redirectPath = userData.gender === 'male' ? '/male' : '/female';
          setIsLoading(false);
          router.replace(redirectPath);
          return;
        }
        setIsLoading(false);
        return;
      }

      // Gender-specific recommendation pages guard
      if (currentPath.startsWith('/male') || currentPath.startsWith('/female')) {
        if (!userData) {
          // No user data, go to guest UI
          setIsLoading(false);
          router.replace('/');
          return;
        } else if (!userData.onboarding_completed) {
          // Onboarding not completed, go to onboarding
          setIsLoading(false);
          router.replace('/onboarding');
          return;
        } else if (userData.gender && !currentPath.startsWith(`/${userData.gender}`)) {
          // Wrong gender page, redirect to correct one
          const correctPath = userData.gender === 'male' ? '/male' : '/female';
          setIsLoading(false);
          router.replace(correctPath);
          return;
        }
      }

      setIsLoading(false);
    };

    // Small delay to ensure localStorage is available
    setTimeout(checkUserFlow, 100);
  }, [router, pathname]);

  if (isLoading && pathname !== '/onboarding' && pathname !== '/') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-black">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading your personalized experience...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
