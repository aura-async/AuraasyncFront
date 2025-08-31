'use client';

import React, { useEffect, useState } from 'react';
import GenderNavbar from '../../../components/GenderNavbar';
import BottomNavigation from '@/components/female/BottomNavigation';

type Product = {
  title: string;
  price: string;
  image: string;
  link: string;
};

export default function FemaleRecommendationsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('');

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      const userData = JSON.parse(localStorage.getItem('auraasync_user_data') || '{}');
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API}/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body_shape: userData.body_shape || 'Hourglass',
          personality_type: userData.personality || 'ISTJ',
          skin_tone: userData.skin_tone || null,
          page: 1,
          limit: 24,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const data = await response.json();
      setProducts((data.products || []) as Product[]);
      setQuery(data.query || '');
    } catch (e: any) {
      setError(e?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-black text-white">
      <GenderNavbar gender="female" />
      <div className="pt-20 pb-20 px-6 max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-bold">Female Recommendations</h1>
          <button
            onClick={fetchRecommendations}
            className="px-4 py-2 bg-pink-600 rounded-lg hover:bg-pink-700"
          >
            Refresh
          </button>
        </div>

        {query && (
          <div className="mb-6 bg-white/10 p-4 rounded-xl text-sm">
            <span className="text-gray-300">Search query:</span>
            <div className="mt-1 font-mono break-words text-yellow-300">{query}</div>
          </div>
        )}

        {loading && (
          <div className="py-20 text-center">Loading personalized picks…</div>
        )}

        {error && (
          <div className="bg-red-900/50 p-4 rounded-xl mb-6">{error}</div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p, idx) => (
              <a
                key={`${p.link}-${idx}`}
                href={p.link}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-gray-900 rounded-2xl p-4 shadow-lg hover:shadow-xl transition"
              >
                <img src={p.image} alt={p.title} className="w-full h-48 object-contain rounded-lg mb-3" />
                <div className="font-semibold line-clamp-2 min-h-[3rem]">{p.title}</div>
                <div className="mt-2 text-green-600 font-bold">{p.price || 'Price N/A'}</div>
                <div className="mt-3 w-full text-center bg-pink-600 text-white rounded-lg py-2">View on Amazon</div>
              </a>
            ))}
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="py-16 text-center text-gray-200">No recommendations found. Try refreshing.</div>
        )}
      </div>
      <BottomNavigation />
    </div>
  );
}


