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

interface ExploreProductsProps {
    gender: 'men' | 'women';
}

const ExploreProducts = ({ gender }: ExploreProductsProps) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAll, setShowAll] = useState(false);
    const [displayCount, setDisplayCount] = useState(12);

    useEffect(() => {
        loadExploreData();
    }, [gender]);

    const loadExploreData = async () => {
        setLoading(true);
        setError(null);

        try {
            // Import the JSON data dynamically
            const dataModule = await import('@/app/data/Explore.json');
            const allProducts: Product[] = dataModule.default || dataModule;

            if (!allProducts || allProducts.length === 0) {
                throw new Error('No products found in explore data');
            }

            console.log(`Total products loaded: ${allProducts.length}`);
            console.log(`Looking for gender: ${gender}`);

            // Filter products by gender
            const filteredProducts = allProducts.filter(product => product.type === gender);

            console.log(`Filtered products for ${gender}: ${filteredProducts.length}`);

            if (filteredProducts.length === 0) {
                throw new Error(`No ${gender} products found in explore data`);
            }

            // Shuffle the products for random display
            const shuffled = shuffleArray([...filteredProducts]);
            setProducts(shuffled);

        } catch (err) {
            console.error('Error loading explore data:', err);
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

    const handleViewMore = () => {
        setShowAll(true);
        setDisplayCount(products.length);
    };

    const handleViewLess = () => {
        setShowAll(false);
        setDisplayCount(12);
    };

    if (loading) {
        return (
            <section className="py-8 bg-[#1a1414] relative">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-8">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
                            <p className="text-xl text-white">Loading explore products...</p>
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
                                onClick={loadExploreData}
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
                    {/* Section Title */}
                    <div className="text-center mb-8">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Explore Products</h2>
                        <p className="text-gray-300 text-lg">Discover our curated collection</p>
                    </div>

                    {/* Products Count */}
                    <div className="mb-6 text-center">
                        <p className="text-gray-300">
                            Showing <span className="text-blue-400 font-semibold">{displayCount}</span> of <span className="text-blue-400 font-semibold">{products.length}</span> products
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {products.slice(0, displayCount).map((product, idx) => (
                            <ProductCard key={`${product.asin}-${idx}`} product={product} />
                        ))}
                    </div>

                    {/* View More/Less Button */}
                    <div className="text-center mt-8">
                        {!showAll ? (
                            <button
                                onClick={handleViewMore}
                                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                            >
                                View All Products ({products.length})
                            </button>
                        ) : (
                            <button
                                onClick={handleViewLess}
                                className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                            >
                                Show Less
                            </button>
                        )}
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
        className="cursor-pointer group bg-white relative text-gray-900 overflow-hidden rounded-2xl p-1 shadow-lg hover:shadow-xl transition-all hover:scale-105 duration-200 flex flex-col h-full"
      >
        {/* Gradient Overlay */}
        <div className="absolute w-full h-full left-0 z-10">
          <div className="w-full h-1/2"></div>
          <div className="w-full h-1/2 bg-gradient-to-b from-transparent to-black"></div>
        </div>
  
        {/* Product Image */}
        <div className="flex-1 relative flex items-center justify-center">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-[374px] object-contain rounded-lg transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>
  
        {/* Bottom Overlay Content */}
        <div className="absolute z-10 px-3 bottom-0 left-0 right-0 flex flex-col justify-end">
          <h3 className="font-extrabold text-white border-b-2 line-clamp-2 min-h-[1rem] mb-2 text-sm">
            {product.title}
          </h3>
          <div className="flex justify-between items-center">
            <p className="text-white font-bold text-lg mb-3">{product.price}</p>
            <span className="text-white rounded-lg py-2 font-medium transition-colors text-sm">
              View on Amazon
            </span>
          </div>
        </div>
      </a>
    );
  };
  

export default ExploreProducts;
