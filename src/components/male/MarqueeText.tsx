const MarqueeText = () => {
  return (
    <section className="py-4 bg-[#1A1414] relative">
      {/* Clear top spacing */}
      
      {/* Full Screen Animated Title */}
      <div className="w-full overflow-hidden mb-4">
        <div className="marquee whitespace-nowrap">
          <span className="text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-wider mx-8">
            EXPLORE | EXPLORE | EXPLORE | EXPLORE | EXPLORE | EXPLORE | EXPLORE | EXPLORE | EXPLORE | EXPLORE
          </span>
        </div>
      </div>
      
      {/* Clear bottom spacing */}
    </section>
  );
};

export default MarqueeText;