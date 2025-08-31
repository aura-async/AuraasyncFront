"use client";

import React from 'react';

interface Product {
  title: string;
  price: string;
  image: string;
  link: string;
}

interface ProductDisplayProps {
  products: Product[];
  searchQuery: string;
  keywords: string[];
  loading?: boolean;
}

const ProductDisplay: React.FC<ProductDisplayProps> = ({ 
  products, 
  searchQuery, 
  keywords, 
  loading = false 
}) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
        <p className="mt-4 text-xl text-indigo-400">Finding perfect products for you...</p>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-red-400 mb-4">No Products Found</h2>
          <p className="text-gray-300 mb-6">We couldn&apos;t find products matching your analysis results.</p>
          <div className="bg-gray-800 p-6 rounded-xl max-w-2xl">
            <h3 className="text-xl font-semibold text-indigo-400 mb-3">Search Query:</h3>
            <p className="text-gray-300 mb-4">{searchQuery}</p>
            <h3 className="text-xl font-semibold text-indigo-400 mb-3">Keywords Used:</h3>
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword, index) => (
                <span key={index} className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-indigo-400 mb-4">Your Personalized Recommendations</h1>
        <p className="text-xl text-gray-300 mb-6">Based on your analysis results</p>
        
        {/* Search Query Display */}
        <div className="bg-gray-800 p-6 rounded-xl max-w-4xl mx-auto mb-6">
          <h2 className="text-2xl font-semibold text-green-400 mb-3">Search Query</h2>
          <p className="text-gray-300 text-lg mb-4">{searchQuery}</p>
          
          <h3 className="text-xl font-semibold text-blue-400 mb-3">Keywords Used</h3>
          <div className="flex flex-wrap justify-center gap-2">
            {keywords.map((keyword, index) => (
              <span key={index} className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                {keyword}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <div key={index} className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
              {/* Product Image */}
              <div className="relative h-64 bg-gray-700">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/300x400/374151/9CA3AF?text=Product+Image';
                  }}
                />
                <div className="absolute top-2 right-2">
                  <span className="bg-indigo-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                    #{index + 1}
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-semibold text-lg text-white mb-2 line-clamp-2">
                  {product.title}
                </h3>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-green-400">
                    {product.price}
                  </span>
                  <span className="text-sm text-gray-400">
                    Amazon
                  </span>
                </div>

                {/* Action Button */}
                <a
                  href={product.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View on Amazon
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center mt-12 text-gray-400">
        <p className="mb-2">Found {products.length} products matching your preferences</p>
        <p className="text-sm">All links are affiliate links that support Auraasync</p>
      </div>
    </div>
  );
};

export default ProductDisplay;

