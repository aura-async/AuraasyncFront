'use client';

import { useState, useEffect } from 'react';

interface Product {
    keyword: string;
    type: string;
    title: string;
    price: string;
    image: string;
    link: string;
    asin: string;
}

interface OccasionData {
    name: string;
    dataFile: string;
}

interface ProductGridProps {
    occasionData?: OccasionData;
}

const ProductGrid = ({ occasionData }: ProductGridProps) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (occasionData) {
            loadOccasionData();
        } else {
            // If no occasion data provided, show empty state or default content
            setLoading(false);
            setProducts([]);
        }
    }, [occasionData]);

    const loadOccasionData = async () => {
        if (!occasionData) return;
        
        setLoading(true);
        setError(null);

        try {
            // Import the JSON data dynamically
            const dataModule = await import(`@/app/male/occasion/Occasiondata/${occasionData.dataFile}`);
            const allProducts: Product[] = dataModule.default || dataModule;

            if (!allProducts || allProducts.length === 0) {
                throw new Error('No products found for this occasion');
            }

            // Shuffle the products for random display
            const shuffled = shuffleArray([...allProducts]);
            setProducts(shuffled);

        } catch (err) {
            console.error('Error loading occasion data:', err);
            setError(err instanceof Error ? err.message : 'Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const shuffleArray = (array: Product[]): Product[] => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    // If no occasion data is provided, show a default or empty state
    if (!occasionData) {
        return (
            <section className="py-8 bg-[#1a1414] relative">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-white mb-4">Featured Products</h2>
                            <p className="text-gray-300 mb-8">Discover our latest fashion recommendations</p>
                        </div>
                        {/* You can add default content here or leave empty */}
                    </div>
                </div>
            </section>
        );
    }

    if (loading) {
        return (
            <section className="py-8 bg-[#1a1414] relative">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-8">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
                            <p className="text-xl text-white">Loading {occasionData.name} products...</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {Array.from({ length: 12 }, (_, i) => (
                                <div key={i} className="bg-white/10 rounded-2xl p-4 animate-pulse">
                                    <div className="w-full h-48 bg-white/20 rounded-lg mb-3"></div>
                                    <div className="h-4 bg-white/20 rounded mb-2"></div>
                                    <div className="h-4 bg-white/20 rounded mb-2 w-3/4"></div>
                                    <div className="h-6 bg-white/20 rounded mb-3 w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="py-8 bg-[#1a1414] relative">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="bg-red-900/50 p-6 rounded-xl mb-6">
                            <h2 className="text-2xl font-bold mb-2 text-red-200">Error</h2>
                            <p className="text-red-300 mb-4">{error}</p>
                            <button
                                onClick={loadOccasionData}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-8 bg-[#1a1414] relative">
            {/* Clear top spacing */}
            
            {/* Product Grid */}
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Products Count */}
                    <div className="mb-6 text-center">
                        <p className="text-gray-300">
                            Found <span className="text-blue-400 font-semibold">{products.length}</span> products for {occasionData.name}
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {products.map((product, idx) => (
                            <ProductCard key={`${product.asin}-${idx}`} product={product} />
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Clear bottom spacing */}
            <div className="h-16"></div>
        </section>
    );
};

const ProductCard = ({ product }: { product: Product }) => {
    return (
        <a
            href={product.link}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer group"
        >
            <div className="relative overflow-hidden">
                <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-[374px] object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className='h-[374px] absolute z-10 top-0 left-0 w-full'>
                    <div className='h-1/2'></div>
                    <div className='bg-gradient-to-b from-transparent to-black/90 h-1/2'></div>
                </div>
            </div>
            
            <div className="mt-4">
                <h3 className="text-lg font-medium text-white mb-2 line-clamp-2">
                    {product.title}
                </h3>
                <p className="text-2xl font-bold text-white">
                    {product.price}
                </p>
            </div>
        </a>
    );
};

export default ProductGrid;