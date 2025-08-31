import React from 'react';

export default function OutfitRecommendationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#1a1414]">
      {children}
    </div>
  );
}
