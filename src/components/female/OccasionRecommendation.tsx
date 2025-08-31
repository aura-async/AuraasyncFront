import Link from 'next/link';
import FlowingMenu from '@/components/female/FlowingMenu';
import './FlowingMenu.css';

import glowUp from "@/app/assets/Occasion/Glow up vibes.png";
import campusFit from "@/app/assets/Occasion/Campys and work fit.png";
import dateChill from "@/app/assets/Occasion/Date night.png";
import shaadi from "@/app/assets/Occasion/Shaadi scenes.png";
import festive from "@/app/assets/Occasion/Festive feels.png";
import vacay from "@/app/assets/Occasion/Vevay mood.png";

const OccasionRecommendations = () => {
  const menuItems = [
    { link: "/female/occasion/glow-up-vibes", text: "GLOW UP VIBES", image: glowUp, slug: "glow-up-vibes" },
    { link: "/female/occasion/campus-or-work-fit", text: "Campus or work Fit", image: campusFit, slug: "campus-or-work-fit" },
    { link: "/female/occasion/date-and-chill", text: "Date & Chill", image: dateChill, slug: "date-and-chill" },
    { link: "/female/occasion/shaadi-scenes", text: "Shaadi Scenes", image: shaadi, slug: "shaadi-scenes" },
    { link: "/female/occasion/festive-feels", text: "Festive Feels", image: festive, slug: "festive-feels" },
    { link: "/female/occasion/vacay-mood", text: "Vacay Mood", image: vacay, slug: "vacay-mood" },
  ];

  return (
    <section className="py-1 bg-[#1a1414] relative min-h-screen">
      {/* Clear top spacing */}
      
      {/* Full Screen Animated Title */}
      <div className="w-full overflow-hidden mb-4">
        <div className="marquee whitespace-nowrap">
          <span className="text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-wider mx-8">
            OCCASION BASED RECOMMENDATION | OCCASION BASED RECOMMENDATION | OCCASION BASED RECOMMENDATION | OCCASION BASED RECOMMENDATION | OCCASION BASED RECOMMENDATION | OCCASION BASED RECOMMENDATION | OCCASION BASED RECOMMENDATION | OCCASION BASED RECOMMENDATION | OCCASION BASED RECOMMENDATION | OCCASION BASED RECOMMENDATION
          </span>
        </div>
      </div>
      
      {/* Content Section - Full Width with Flowing Menu */}
      <div className="w-full h-[80vh]">
        <FlowingMenu items={menuItems} />
      </div>
      
      {/* Clear bottom spacing */}
    </section>
  );
};

export default OccasionRecommendations;