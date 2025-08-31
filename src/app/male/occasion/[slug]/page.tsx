import { notFound } from 'next/navigation';
import ProductGrid from '@/components/male/ProductGrid';
import { Metadata } from 'next';

// Define the mapping of slugs to display names and data files
const occasionNames: { [key: string]: { name: string; dataFile: string } } = {
  'glow-up-vibes': { 
    name: 'GLOW UP VIBES', 
    dataFile: 'Glow up vibes Men.json' 
  },
  'campus-work-fit': { 
    name: 'Campus or Work Fit', 
    dataFile: 'Campus Fit Mens.json' 
  },
  'date-chill': { 
    name: 'Date & Chill', 
    dataFile: 'Date and Chill men.json' 
  },
  'shaadi-scenes': { 
    name: 'Shaadi Scenes', 
    dataFile: 'Shaadi Scence Men.json' 
  },
  'festive-feels': { 
    name: 'Festive Feels', 
    dataFile: 'Festive feels Men.json' 
  },
  'vacay-mood': { 
    name: 'Vacay Mood', 
    dataFile: 'Vecay Mood Men.json' 
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
    title: `${occasionData.name} - Male Fashion Recommendations`,
    description: `Discover the perfect ${occasionData.name.toLowerCase()} fashion recommendations for men. Browse our curated collection of stylish outfits.`,
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
       
      </section>

      {/* Occasion Title Header */}
      <section className="py-8 bg-[#1a1414] relative">
        <div className="w-full overflow-hidden mb-8">
          <div className="marquee whitespace-nowrap">
            <span className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-wider mx-8">
              {occasionData.name} | {occasionData.name} | {occasionData.name} | {occasionData.name} |
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
