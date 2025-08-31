'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiSearch, FiHeart, FiStar } from 'react-icons/fi';

const searchCategories = {
  men: [
    'Shirt',
    'T-shirts',
    'Bottom wear',
    'Coats and jackets',
    'Ethnic wear'
  ],
  women: [
    'Tops',
    'Dresses & One Piece',
    'Shirts and T-shirt (Casual)',
    'Bottoms',
    'Ethnic Wear',
    'Outerwear'
  ]
};

const occasionRecommendations = [
  {
    title: 'Glow-Up Vibes',
    description: 'For parties, birthdays, clubbing, celebrations',
    keywords: ['party wear', 'celebration', 'glamorous', 'festive'],
    icon: '🎉'
  },
  {
    title: 'Campus or Work Fit',
    description: 'For college, fresher\'s parties, casual hangouts, office wear, semi-formals, presentations',
    keywords: ['casual', 'office wear', 'college', 'semi-formal'],
    icon: '💼'
  },
  {
    title: 'Date & Chill',
    description: 'For dates, movies, coffee meets',
    keywords: ['date night', 'casual', 'comfortable', 'stylish'],
    icon: '💕'
  },
  {
    title: 'Shaadi Scenes',
    description: 'Weddings, sangeet, mehendi, reception',
    keywords: ['wedding', 'ethnic', 'traditional', 'celebration'],
    icon: '👰'
  },
  {
    title: 'Festive Feels',
    description: 'Diwali, Eid, Navratri, Holi looks',
    keywords: ['festival', 'traditional', 'colorful', 'ethnic'],
    icon: '🎊'
  },
  {
    title: 'Vacay Mood',
    description: 'Beach trips, travel, casual summer/winter getaways',
    keywords: ['vacation', 'travel', 'beach', 'casual', 'comfortable'],
    icon: '✈️'
  }
];

const SearchCategoriesPage = () => {
  const router = useRouter();

  const handleCategoryClick = (category: string, gender?: string) => {
    const query = gender ? `${gender} ${category}` : category;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleOccasionClick = (occasion: any) => {
    const query = occasion.title.toLowerCase();
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-800">
              <FiArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">Browse Categories</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Categories Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Fashion Categories</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Men's Categories */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-lg">M</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Men</h3>
              </div>
              
              <div className="grid gap-3">
                {searchCategories.men.map((category, index) => (
                  <button
                    key={index}
                    onClick={() => handleCategoryClick(category, 'men')}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-blue-50 hover:border-blue-200 border border-transparent transition-all duration-200 group"
                  >
                    <span className="font-medium text-gray-700 group-hover:text-blue-700">{category}</span>
                    <FiSearch className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            {/* Women's Categories */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                  <span className="text-pink-600 font-bold text-lg">W</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Women</h3>
              </div>
              
              <div className="grid gap-3">
                {searchCategories.women.map((category, index) => (
                  <button
                    key={index}
                    onClick={() => handleCategoryClick(category, 'women')}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-pink-50 hover:border-pink-200 border border-transparent transition-all duration-200 group"
                  >
                    <span className="font-medium text-gray-700 group-hover:text-pink-700">{category}</span>
                    <FiSearch className="w-4 h-4 text-gray-400 group-hover:text-pink-500 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Occasion-based Recommendations */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Occasion-based Recommendations</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {occasionRecommendations.map((occasion, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-3xl">{occasion.icon}</span>
                    <h3 className="text-xl font-bold text-gray-800">{occasion.title}</h3>
                  </div>
                  
                  <p className="text-gray-600 mb-4 leading-relaxed">{occasion.description}</p>
                  
                  <button
                    onClick={() => handleOccasionClick(occasion)}
                    className="w-full bg-yellow-400 text-black font-semibold py-3 px-4 rounded-lg hover:bg-yellow-300 transition-colors flex items-center justify-center space-x-2"
                  >
                    <FiSearch className="w-4 h-4" />
                    <span>Find Products</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Search Section */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-black mb-4">Can&apos;t find what you&apos;re looking for?</h3>
          <p className="text-black/80 mb-6">Use our advanced search to find exactly what you need</p>
          <Link
            href="/search"
            className="inline-flex items-center space-x-2 bg-black text-white font-semibold px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <FiSearch className="w-4 h-4" />
            <span>Advanced Search</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SearchCategoriesPage;
