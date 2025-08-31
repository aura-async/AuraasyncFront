"use client";

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function ConditionalFooter() {
  const pathname = usePathname();
  const isOnboarding = pathname?.startsWith('/onboarding');

  if (isOnboarding) {
    return null;
  }

  return <Footer />;
}
