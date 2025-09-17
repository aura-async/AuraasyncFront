'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams, usePathname } from 'next/navigation';
import GenderNavbar from '../../../../components/GenderNavbar';
import BottomNavigation from '@/components/male/BottomNavigation';

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
    'mens-shirts': {
        title: "Men's Shirts",
        description: "Discover our latest Men's Shirts collection",
        slug: 'mens-shirts',
        dataFile: 'men_s shirts.json'
    },
    'mens-ethnic-wear': {
        title: "Men's Ethnic Wear",
        description: "Discover our latest Men's ethnic wear collection",
        slug: 'mens-ethnic-wear',
        dataFile: 'ethnic kurta set men.json'
    },
    'mens-bottomwear': {
        title: "Men's Bottomwear",
        description: "Discover our latest men's bottomwear collection",
        slug: 'mens-bottomwear',
        dataFile: 'men_s bottomwear.json'
    },
    'mens-tshirts': {
        title: "Men's T-shirts",
        description: "Discover our latest Men's T-shirt collection",
        slug: 'mens-tshirts',
        dataFile: 'men_s t-shirts.json'
    },
    'mens-jackets': {
        title: "Men's Jackets",
        description: "Discover our latest men's jacket collection",
        slug: 'mens-jackets',
        dataFile: 'slim fit casual blazer men.json'
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
            <div className="min-h-screen bg-[#251F1E] text-white">
                <GenderNavbar gender="male" />
                <div className="pt-20 pb-20 px-6 max-w-7xl mx-auto text-center">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">Category Not Found</h1>
                    <p className="text-gray-300 mb-6">The requested category does not exist.</p>
                    <button
                        onClick={() => router.push('/male')}
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
        <div className="min-h-screen bg-[#251F1E] text-white">
            <GenderNavbar gender="male" />
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
                            onClick={() => router.push('/male')}
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

                        {/* Loading Skeleton */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {Array.from({ length: 12 }, (_, i) => (
                                <div key={i} className="bg-white/10 rounded-2xl p-4 animate-pulse">
                                    <div className="w-full h-48 bg-white/20 rounded-lg mb-3"></div>
                                    <div className="h-4 bg-white/20 rounded mb-2"></div>
                                    <div className="h-4 bg-white/20 rounded mb-2 w-3/4"></div>
                                    <div className="h-6 bg-white/20 rounded mb-3 w-1/2"></div>
                                    <div className="h-10 bg-white/20 rounded"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-900/50 p-6 rounded-xl mb-6">
                        <h2 className="text-2xl font-bold mb-2 text-red-200">Error</h2>
                        <p className="text-red-300 mb-4">{error}</p>
                        <button
                            onClick={handleRefresh}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Try Again
                        </button>
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

                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                            {products.map((product, idx) => (
                                <a
                                    key={`${product.asin}-${idx}`}
                                    href={product.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-white relative text-gray-900 overflow-hidden rounded-2xl p-1 shadow-lg hover:shadow-xl transition-all hover:scale-105 duration-200 flex flex-col h-full"
                                >
                                    <div className='absolute w-full h-full left-0 z-10'>
                                        <div className='w-full h-1/2 '></div>
                                        <div className='w-full h-1/2 bg-gradient-to-b from-transparent  to-black '></div>
                                    </div>
                                    <div className="flex-1 relative flex items-center justify-center ">
                                        <img
                                            src={product.image}
                                            alt={product.title}
                                            className="w-full h-[300px] object-contain rounded-lg"
                                        />
                                    </div>
                                    {/* Removed absolute positioning and mt-auto */}
                                    <div className="absolute z-10 px-3  bottom-0 left-0  right-0 flex flex-col justify-end">
                                        <div className="font-extrabold text-white border-b-2 line-clamp-2 min-h-[1rem] mb-2 text-sm">
                                            {product.title}
                                        </div>
                                        <div className='flex justify-between items-center'>
                                            <div className="text-white font-bold text-lg mb-3">
                                            {product.price}
                                        </div>
                                        <div className="  text-white rounded-lg py-2 font-medium  transition-colors text-sm">
                                            View on Amazon
                                        </div>
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>


                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mb-8">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>

                                <div className="flex gap-2">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                className={`px-3 py-2 rounded-lg transition-colors ${currentPage === pageNum
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-600 text-white hover:bg-gray-700'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        )}

                        {/* Page Info */}
                        <div className="text-center text-gray-300 text-sm">
                            Showing {((currentPage - 1) * productsPerPage) + 1} to {Math.min(currentPage * productsPerPage, shuffledProducts.length)} of {shuffledProducts.length} products
                        </div>
                    </>
                )}

                {/* No Products State */}
                {!loading && !error && products.length === 0 && (
                    <div className="py-16 text-center text-gray-200">
                        <h2 className="text-2xl font-bold mb-2">No Products Found</h2>
                        <p className="text-gray-400 mb-4">We couldn&apos;t find any products in this category.</p>
                        <button
                            onClick={handleRefresh}
                            className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Refresh
                        </button>
                    </div>
                )}
            </div>
            <BottomNavigation />
        </div>
    );
}
