'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import BottomNavigation from '@/components/female/BottomNavigation';

export default function NotFound() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-[#1a1414] text-white">
            <div className="pt-20 pb-20 px-6 max-w-7xl mx-auto text-center">
                <div className="mb-8">
                    <div className="text-6xl mb-4">🛍️</div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Category Not Found</h1>
                    <p className="text-xl text-gray-300 mb-6">
                        Sorry, the outfit category you&apos;re looking for doesn&apos;t exist.
                    </p>
                </div>

                <div className="space-y-4">
                    <p className="text-gray-400 mb-8">
                        Available categories include:
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                        <div className="bg-gray-800 p-4 rounded-lg">
                            <h3 className="font-semibold mb-2">Women&apos;s Dresses</h3>
                            <p className="text-sm text-gray-400">Elegant dresses for every occasion</p>
                        </div>
                        <div className="bg-gray-800 p-4 rounded-lg">
                            <h3 className="font-semibold mb-2">Women&apos;s Shirts</h3>
                            <p className="text-sm text-gray-400">Stylish shirts for professional and casual wear</p>
                        </div>
                        <div className="bg-gray-800 p-4 rounded-lg">
                            <h3 className="font-semibold mb-2">Women&apos;s Bottomwear</h3>
                            <p className="text-sm text-gray-400">Comfortable and trendy bottomwear</p>
                        </div>
                        <div className="bg-gray-800 p-4 rounded-lg">
                            <h3 className="font-semibold mb-2">Women&apos;s T-shirts</h3>
                            <p className="text-sm text-gray-400">Casual and comfortable t-shirts</p>
                        </div>
                        <div className="bg-gray-800 p-4 rounded-lg">
                            <h3 className="font-semibold mb-2">Women&apos;s Coats</h3>
                            <p className="text-sm text-gray-400">Warm and stylish coats</p>
                        </div>
                        <div className="bg-gray-800 p-4 rounded-lg">
                            <h3 className="font-semibold mb-2">Women&apos;s Ethnic Wear</h3>
                            <p className="text-sm text-gray-400">Traditional ethnic wear collection</p>
                        </div>
                    </div>
                </div>

                <div className="mt-12 space-x-4">
                    <button
                        onClick={() => router.push('/female')}
                        className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Back to Home
                    </button>
                    <button
                        onClick={() => router.back()}
                        className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
            <BottomNavigation />
        </div>
    );
}
