'use client';

import React, { useState } from 'react';
import { getUserData } from '../../lib/userState';
import { useRouter } from 'next/navigation';
import BottomNavigation from '@/components/male/BottomNavigation';
import Navbar from '@/components/Navbar';

export default function Search() {
  const userData = getUserData();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Redirect if no user data
  React.useEffect(() => {
    if (!userData) {
      router.push('/');
    }
  }, [userData, router]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API}/scrape-by-keywords`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          keywords: searchQuery.split(/[,\s]+/).filter(Boolean),
          gender: userData?.gender
        }),
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      } else {
        console.error('Search failed');
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white p-8 pb-20">
      {/* Navbar for mobile */}
      <Navbar 
        items={[
          { icon: <span>🏠</span>, label: "Home", onClick: () => router.push(`/${userData.gender}`) },
          { icon: <span>🔍</span>, label: "Search", onClick: () => router.push('/search') },
          { icon: <span>💇</span>, label: "Hairstyle", onClick: () => userData.face_shape ? router.push('/hairstyle') : null },
          { icon: <span>⚙️</span>, label: "Dashboard", onClick: () => router.push('/dashboard') },
        ]}
      />
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Product Search</h1>
          <p className="text-gray-300">Find the perfect fashion items for your style</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for fashion items..."
              className="flex-1 px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:border-white/50"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={loading || !searchQuery.trim()}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Products Grid */}
        {products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden hover:bg-white/20 transition-all">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-product.jpg';
                  }}
                />
                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2">{product.title}</h3>
                  <p className="text-green-400 font-bold mb-3">{product.price}</p>
                  <a
                    href={product.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
                  >
                    View on Amazon
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && products.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No products found</h3>
            <p className="text-gray-300">Try adjusting your search terms</p>
          </div>
        )}

        {/* Initial State */}
        {!loading && products.length === 0 && !searchQuery && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛍️</div>
            <h3 className="text-xl font-semibold mb-2">Ready to discover fashion?</h3>
            <p className="text-gray-300">Search for your favorite styles and get personalized recommendations</p>
          </div>
        )}
      </div>
      <BottomNavigation />
    </div>
  );
}
