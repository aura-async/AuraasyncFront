import { notFound } from 'next/navigation';
import ProductGrid from '@/components/female/ProductGrid';
import { Metadata } from 'next';

// Define the mapping of slugs to display names and data files
const occasionNames: { [key: string]: { name: string; dataFile: string } } = {
  'glow-up-vibes': { 
    name: 'GLOW UP VIBES', 
    dataFile: 'Glow Up vibes Women.json' 
  },
  'campus-or-work-fit': { 
    name: 'Campus or work Fit', 
    dataFile: 'Campus fit Women.json' 
  },
  'date-and-chill': { 
    name: 'Date & Chill', 
    dataFile: 'Date and Chill Women.json' 
  },
  'shaadi-scenes': { 
    name: 'Shaadi Scenes', 
    dataFile: 'Shaadi Scence Women.json' 
  },
  'festive-feels': { 
    name: 'Festive Feels', 
    dataFile: 'Festive Feels women.json' 
  },
  'vacay-mood': { 
    name: 'Vacay Mood', 
    dataFile: 'Vecay Mood Women.json' 
  },
};

interface OccasionPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate metadata for dynamic routes
export async function generateMetadata({ params }: OccasionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const occasionData = occasionNames[slug];
  
  if (!occasionData) {
    return {
      title: 'Occasion Not Found',
    };
  }

  return {
    title: `${occasionData.name} - Female Fashion Recommendations`,
    description: `Discover the perfect ${occasionData.name.toLowerCase()} fashion recommendations for women. Browse our curated collection of stylish outfits.`,
  };
}

const OccasionPage = async ({ params }: OccasionPageProps) => {
  const { slug } = await params;
  const occasionData = occasionNames[slug];

  if (!occasionData) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#1a1414] pb-20">
      {/* Page Title */}
      <section className="pt-8 pb-4 bg-[#1a1414]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center">
            {occasionData.name}
          </h1>
        </div>
      </section>

      {/* Occasion Title Header */}
      <section className="py-8 bg-[#1a1414] relative">
        <div className="w-full overflow-hidden mb-8">
          <div className="marquee whitespace-nowrap">
            <span className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-wider mx-8">
              {occasionData.name} | {occasionData.name} | {occasionData.name} | {occasionData.name}
            </span>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <ProductGrid occasionData={occasionData} />
    </div>
  );
};

export default OccasionPage;
