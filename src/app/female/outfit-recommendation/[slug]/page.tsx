'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams, usePathname } from 'next/navigation';
import GenderNavbar from '../../../../components/GenderNavbar';
import BottomNavigation from '@/components/female/BottomNavigation';

interface Product {
    keyword: string;
    type: string;
    title: string;
    price: string;
    image: string;
    link: string;
    asin: string;
}

interface CategoryData {
    [key: string]: {
        title: string;
        description: string;
        slug: string;
        dataFile: string;
    };
}

const CATEGORIES: CategoryData = {
    'womens-dresses': {
        title: "Women's Dresses",
        description: "Discover our latest Women's Dresses collection",
        slug: 'womens-dresses',
        dataFile: 'floral mini dress women.json'
    },
    'womens-shirts': {
        title: "Women's Shirts",
        description: "Discover our latest Women's Shirts collection",
        slug: 'womens-shirts',
        dataFile: 'women_s shirts.json'
    },
    'womens-bottomwear': {
        title: "Women's Bottomwear",
        description: "Discover our latest Women's Bottomwear collection",
        slug: 'womens-bottomwear',
        dataFile: 'women_s bottomwear.json'
    },
    'womens-tshirts': {
        title: "Women's T-shirts",
        description: "Discover our latest Women's T-shirt collection",
        slug: 'womens-tshirts',
        dataFile: 'women_s t-shirts.json'
    },
    'womens-coats': {
        title: "Women's Coats",
        description: "Discover our latest Women's Coats collection",
        slug: 'womens-coats',
        dataFile: 'women_s coats.json'
    },
    'womens-ethnic-wear': {
        title: "Women's Ethnic Wear",
        description: "Discover our latest Women's Ethnic Wear collection",
        slug: 'womens-ethnic-wear',
        dataFile: 'kurta palazzo set women.json'
    }
};

export default function OutfitRecommendationsPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug as string;

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [shuffledProducts, setShuffledProducts] = useState<Product[]>([]);
    const [sort, setSort] = useState<'relevant' | 'price-asc' | 'price-desc'>('relevant');

    const searchParams = useSearchParams();
    const pathname = usePathname();

    const productsPerPage = 12;
    const category = CATEGORIES[slug];

    useEffect(() => {
        if (!category) {
            setError('Category not found');
            setLoading(false);
            return;
        }

        const initialSort = (searchParams?.get('sort') || 'relevant') as 'relevant' | 'price-asc' | 'price-desc';
        setSort(initialSort);
        loadCategoryData(initialSort);
    }, [slug]);

    const loadCategoryData = async (initialSort?: 'relevant' | 'price-asc' | 'price-desc') => {
        setLoading(true);
        setError(null);

        try {
            // Import the JSON data dynamically
            const dataModule = await import(`../data/${category.dataFile}`);
            const allProducts: Product[] = dataModule.default || dataModule;

            if (!allProducts || allProducts.length === 0) {
                throw new Error('No products found in this category');
            }

            // Shuffle the products for random display (base order for "relevant")
            const shuffled = shuffleArray([...allProducts]);
            setShuffledProducts(shuffled);

            // Calculate total pages
            const total = Math.ceil(shuffled.length / productsPerPage);
            setTotalPages(total);

            // Set initial page and apply initial sort
            setCurrentPage(1);
            const base = applySortToList(shuffled, initialSort || sort);
            updateDisplayedProducts(base, 1);

        } catch (err) {
            console.error('Error loading category data:', err);
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

    const updateDisplayedProducts = (allProducts: Product[], page: number) => {
        const startIndex = (page - 1) * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        const pageProducts = allProducts.slice(startIndex, endIndex);
        setProducts(pageProducts);
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
        // Update URL without full navigation
        const query = params.toString();
        const url = query ? `${pathname}?${query}` : `${pathname}`;
        router.replace(url);

        // Recompute pages and reset to first page with sorted list
        const base = applySortToList(shuffledProducts, value);
        setCurrentPage(1);
        const total = Math.ceil(base.length / productsPerPage);
        setTotalPages(total);
        updateDisplayedProducts(base, 1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        const base = applySortToList(shuffledProducts, sort);
        updateDisplayedProducts(base, page);
        // Scroll to top when page changes
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleRefresh = () => {
        loadCategoryData();
    };

    if (!category) {
        return (
            <div className="min-h-screen bg-[#1a1414] text-white">
                <div className="pt-20 pb-20 px-6 max-w-7xl mx-auto text-center">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">Category Not Found</h1>
                    <p className="text-gray-300 mb-6">The requested category does not exist.</p>
                    <button
                        onClick={() => router.push('/female')}
                        className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Back to Home
                    </button>
                </div>
                <BottomNavigation />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#1a1414] text-white">
            <div className="pt-20 pb-20 px-6 max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">{category.title}</h1>
                            <p className="text-gray-300 text-lg">{category.description}</p>
                        </div>
                    </div>

                    {/* Breadcrumb */}
                    <nav className="text-sm text-gray-400 mb-4">
                        <span
                            className="cursor-pointer hover:text-white transition-colors"
                            onClick={() => router.push('/female')}
                        >
                            Home
                        </span>
                        <span className="mx-2">/</span>
                        <span className="text-white">{category.title}</span>
                    </nav>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="py-8">
                        <div className="text-center mb-8">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
                            <p className="text-xl">Loading {category.title}...</p>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="py-8">
                        <div className="text-center mb-8">
                            <div className="text-red-400 text-6xl mb-4">⚠️</div>
                            <h2 className="text-2xl font-bold mb-2">Oops! Something went wrong</h2>
                            <p className="text-gray-300 mb-6">{error}</p>
                            <button
                                onClick={handleRefresh}
                                className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                )}

                {/* Products Grid */}
                {!loading && !error && products.length > 0 && (
                    <>
                        {/* Toolbar */}
                        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-gray-300">
                                Found <span className="text-blue-400 font-semibold">{shuffledProducts.length}</span> products in {category.title}
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

                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                            {products.map((product, index) => (
                               <div
                               key={`${product.asin}-${index}`}
                               className="bg-white relative text-gray-900 overflow-hidden rounded-2xl p-1 shadow-lg hover:shadow-xl transition-all hover:scale-105 duration-200 flex flex-col h-full"
                             >
                               {/* Gradient overlay */}
                               <div className="absolute w-full h-full left-0 z-10">
                                 <div className="w-full h-1/2"></div>
                                 <div className="w-full h-1/2 bg-gradient-to-b from-transparent to-black"></div>
                               </div>
                             
                               {/* Product Image */}
                               <div className="flex-1 relative flex items-center justify-center">
                                 <img
                                   src={product.image}
                                   alt={product.title}
                                   className="w-full h-[300px] object-contain rounded-lg"
                                   loading="lazy"
                                 />
                               </div>
                             
                               {/* Bottom Content */}
                               <div className="absolute z-10 px-3 bottom-0 left-0 right-0 flex flex-col justify-end">
                                 <div className="font-extrabold text-white border-b-2 line-clamp-2 min-h-[1rem] mb-2 text-sm">
                                   {product.title}
                                 </div>
                                 <div className="flex justify-between items-center">
                                   <div className="text-white font-bold text-lg mb-3">{product.price}</div>
                                   <a
                                     href={product.link}
                                     target="_blank"
                                     rel="noopener noreferrer"
                                     className="text-white rounded-lg py-2 font-medium transition-colors text-sm"
                                   >
                                     View on Amazon
                                   </a>
                                 </div>
                               </div>
                             </div>
                             
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center space-x-2 mb-8">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                                >
                                    Previous
                                </button>
                                
                                <span className="px-4 py-2 text-gray-300">
                                    Page {currentPage} of {totalPages}
                                </span>
                                
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* No Products State */}
                {!loading && !error && products.length === 0 && (
                    <div className="py-8">
                        <div className="text-center mb-8">
                            <div className="text-gray-400 text-6xl mb-4">🛍️</div>
                            <h2 className="text-2xl font-bold mb-2">No Products Found</h2>
                            <p className="text-gray-300 mb-6">We couldn&apos;t find any products in this category.</p>
                            <button
                                onClick={handleRefresh}
                                className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Refresh
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <BottomNavigation />
        </div>
    );
}
