import React from 'react';

export default function OutfitRecommendationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black">
      {children}
    </div>
  );
}
