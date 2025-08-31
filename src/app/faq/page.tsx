'use client';

import React from 'react';

const FAQPage = () => {
  return (
    <div className="container-custom py-20">
      <h1 className="font-serif text-display text-center mb-12">Frequently Asked Questions</h1>
      
      <div className="space-y-8">
        {/* Placeholder FAQ Item */}
        <div>
          <h2 className="text-xl font-semibold mb-2">What is Auraasync Fashion?</h2>
          <p className="text-primary/80">Auraasync Fashion is an online platform dedicated to helping you discover and express your unique fashion personality through carefully curated pieces.</p>
        </div>
        
        {/* Placeholder FAQ Item */}
        <div>
          <h2 className="text-xl font-semibold mb-2">How does the style quiz work?</h2>
          <p className="text-primary/80">Our style quiz analyzes your preferences, lifestyle, and inspirations to provide personalized fashion recommendations and insights into your unique style identity.</p>
        </div>
        
        {/* Add more FAQ items here */}
      </div>
    </div>
  );
};

export default FAQPage; 