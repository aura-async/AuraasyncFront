'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

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
    const [baseProducts, setBaseProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sort, setSort] = useState<'relevant' | 'price-asc' | 'price-desc'>('relevant');

    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (occasionData) {
            const initialSort = (searchParams?.get('sort') || 'relevant') as 'relevant' | 'price-asc' | 'price-desc';
            setSort(initialSort);
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
            const dataModule = await import(`@/app/female/occasion/Women/Occasion/${occasionData.dataFile}`);
            const allProducts: Product[] = dataModule.default || dataModule;

            if (!allProducts || allProducts.length === 0) {
                throw new Error('No products found for this occasion');
            }

            // Shuffle the products for random display (base order for "relevant")
            const shuffled = shuffleArray([...allProducts]);
            setBaseProducts(shuffled);
            setProducts(applySortToList(shuffled, sort));

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

    const parsePrice = (priceText: string): number => {
        if (!priceText) return 0;
        const cleaned = priceText.replace(/[^0-9.]/g, '');
        const value = parseFloat(cleaned);
        return isNaN(value) ? 0 : value;
    };

    const applySortToList = (list: Product[], sortKey: 'relevant' | 'price-asc' | 'price-desc'): Product[] => {
        if (sortKey === 'relevant') return list;
        const withNumericPrice = [...list].map(p => ({ ...p, __price: parsePrice(p.price) as number }));
        withNumericPrice.sort((a, b) => {
            if (sortKey === 'price-asc') return (a.__price as number) - (b.__price as number);
            return (b.__price as number) - (a.__price as number);
        });
        return withNumericPrice.map((p) => {
            const { __price, ...rest } = p as unknown as Product & { __price?: number };
            return rest as Product;
        });
    };

    const handleSortChange = (value: 'relevant' | 'price-asc' | 'price-desc') => {
        setSort(value);
        const params = new URLSearchParams(searchParams?.toString());
        if (value === 'relevant') {
            params.delete('sort');
        } else {
            params.set('sort', value);
        }
        const query = params.toString();
        const url = query ? `${pathname}?${query}` : `${pathname}`;
        router.replace(url);

        setProducts(applySortToList(baseProducts, value));
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
                    {/* Toolbar */}
                    <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-gray-300">
                            Found <span className="text-blue-400 font-semibold">{baseProducts.length}</span> products for {occasionData.name}
                        </p>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-300">Sort by</span>
                            <select
                                value={sort}
                                onChange={(e) => handleSortChange(e.target.value as 'relevant' | 'price-asc' | 'price-desc')}
                                className="bg-gray-700 text-white text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="relevant">Relevant</option>
                                <option value="price-desc">Price: High to Low</option>
                                <option value="price-asc">Price: Low to High</option>
                            </select>
                        </div>
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
        className="cursor-pointer group bg-white relative text-gray-900 overflow-hidden rounded-2xl p-1 shadow-lg hover:shadow-xl transition-all hover:scale-105 duration-200 flex flex-col h-full"
      >
        {/* Gradient Overlay */}
        <div className="absolute w-full h-full left-0 z-10">
          <div className="w-full h-1/2"></div>
          <div className="w-full h-1/2 bg-gradient-to-b from-transparent to-black"></div>
        </div>
      
        {/* Product Image */}
        <div className="flex-1 relative flex items-center bg-white justify-center">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-[400px] object-contain rounded-lg transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      
        {/* Bottom Content */}
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

export default ProductGrid;