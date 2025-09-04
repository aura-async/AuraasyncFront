import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';

// Register GSAP plugins with error handling
if (typeof window !== 'undefined') {
  try {
    gsap.registerPlugin(ScrollTrigger);
  } catch (error) {
    console.warn('GSAP ScrollTrigger registration failed:', error);
  }
}

const cards = [
  {
    title: "Face structure",
    description: "Upload a clear photo of your face to determine your face shape and get customized suggestions for hairstyles, makeup and accessories. We keep in mind of all the aspect such as eye color, hair texture, skin tone before giving personalized suggestions",
    imageUrl: "/face-structure.png",
    blobUrl: null,
    imagePosition: "right",
    link: "/face-analysis"
  },
  {
    title: "Body type Analysis",
    description: "Upload your full length picture to obtain your body type category or manually enter it if you know to get personalized fashion recommendations that suits your body.",
    imageUrl: "/body-type.png",
    blobUrl: null,
    imagePosition: "left",
    link: "/body-analysis"
  },
  {
    title: "Personality Analysis",
    description: "Answer a few question to achieve clothing suggestion that aligns with and enhance your individual style and personal expression",
    imageUrl: "/personality.png",
    blobUrl: null,
    imagePosition: "right",
    link: "/personality-analysis"
  }
];

const Card = ({
  title,
  description,
  imageUrl,
  blobUrl,
  imagePosition,
  cardBackgroundColor,
  cardBorderColor,
  link,
}) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true, margin: "0px 0px -100px 0px" }}
      className="relative w-[95vw] sm:w-[500px] md:w-[750px] lg:w-[950px] min-h-[450px] md:min-h-[550px] rounded-2xl overflow-hidden shadow-2xl p-4 sm:p-6 md:p-12 border-2"
      style={{
        backgroundColor: cardBackgroundColor,
        borderColor: cardBorderColor,
        transformStyle: "preserve-3d",
        perspective: "1000px",
        willChange: "transform, opacity",
      }}
    >
      <Link href={link} className="block h-full">
        <div
          className={`flex relative h-full flex-col md:flex-row justify-center items-center gap-y-4 sm:gap-y-6 md:gap-x-8 ${
            imagePosition === "right" ? "" : "md:flex-row-reverse"
          }`}
        >
          {/* Text Section */}
          <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-white">
              {title}
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-neutral-300 mb-6 sm:mb-8 max-w-full px-2 sm:px-4 md:px-0">
              {description}
            </p>
          </div>

          {/* Image Section */}
          <div className="relative w-full md:w-1/2 h-48 sm:h-64 md:h-[500px] overflow-hidden rounded-xl flex items-center justify-center">
            <Image
              fill
              src={imageUrl}
              alt={title}
              className="object-contain w-full h-full"
              style={{ objectPosition: "center center" }}
              loading="lazy"
              onError={(e) => {
                console.warn(`Failed to load image: ${imageUrl}`);
                const target = e.target as HTMLImageElement;
                if (target) {
                  target.style.display = "none";
                }
              }}
            />
            {blobUrl && (
              <div
                className="absolute inset-0 opacity-50 mix-blend-overlay"
                style={{
                  backgroundImage: `url(${blobUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};


const InteractiveCards = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const prefersReducedMotion = useReducedMotion();
  const scrollbarRef = useRef<HTMLDivElement>(null);
  const marqueeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isAnimationsEnabled, setIsAnimationsEnabled] = useState(true);

  const SCROLLBAR_HEIGHT_PX = 300;
  const INITIAL_SECOND_CARD_Y_PERCENT = 50;
  const INITIAL_THIRD_CARD_Y_PERCENT = 100;
  const CARD_BACKGROUND_COLOR = 'rgb(25, 25, 25)';
  const CARD_BORDER_COLOR = 'rgb(150, 150, 159)';

  useEffect(() => {
    // Check if GSAP and ScrollTrigger are available
    if (!gsap || !ScrollTrigger) {
      console.warn('GSAP or ScrollTrigger not available, disabling animations');
      setIsAnimationsEnabled(false);
      return;
    }

    if (prefersReducedMotion || typeof window === 'undefined' || !isAnimationsEnabled) {
      console.log('Animations disabled due to preferences or environment');
      return;
    }

    // Marquee animation with error handling
    marqueeRefs.current.forEach((ref, index) => {
      if (ref) {
        try {
          gsap.fromTo(ref,
            { xPercent: 0 },
            {
              xPercent: -100,
              repeat: -1,
              duration: 20,
              ease: "none",
              immediateRender: true
            }
          );
        } catch (error) {
          console.warn(`Marquee animation ${index} failed:`, error);
        }
      }
    });

    const section = sectionRef.current;
    const scrollbar = scrollbarRef.current;
    const scrollIndicator = document.getElementById("scroll-indicator");

    if (!section || !scrollbar || !scrollIndicator) {
      console.warn('Required DOM elements not found for scroll animations');
      return;
    }

    // Type assertion after null check
    const scrollbarElement = scrollbar as HTMLDivElement;
    const scrollIndicatorElement = scrollIndicator as HTMLElement;

    const ctx = gsap.context(() => {
      try {
        // Set initial positions
        gsap.set(cardRefs.current, {
          yPercent: 0,
          opacity: 1,
          rotation: 0,
          scale: 1
        });

        // Create a master timeline for better control
        const masterTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=2000",
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            pinSpacing: true,
            invalidateOnRefresh: true,
            fastScrollEnd: true,
            onRefresh: () => console.log('ScrollTrigger refreshed'),
            onRefreshInit: () => console.log('ScrollTrigger refresh init'),
          }
        });

        // Card animations
        masterTimeline
          // Initial state
          .set(cardRefs.current[0], { yPercent: -55, zIndex: 31 })
          .set(cardRefs.current[1], { 
            yPercent: INITIAL_SECOND_CARD_Y_PERCENT, 
            opacity: 0.5,
            zIndex: 32 
          })
          .set(cardRefs.current[2], { 
            yPercent: INITIAL_THIRD_CARD_Y_PERCENT, 
            opacity: 0.5,
            zIndex: 33 
          })

          // First card comes into focus
          .to(cardRefs.current[0], {
            scale: 0.95,
            rotation: 2,
            ease: "power2.inOut",
            duration: 1
          }, 0)

          // Second card moves up
          .to(cardRefs.current[1], {
            yPercent: -55,
            opacity: 1,
            rotation: -2,
            ease: "power2.inOut",
            duration: 1
          }, 0)

          // Third card moves up to second position
          .to(cardRefs.current[2], {
            yPercent: INITIAL_SECOND_CARD_Y_PERCENT,
            opacity: 1,
            rotation: 2,
            ease: "power2.inOut",
            duration: 1
          }, 0)

          // Then third card moves to focus position
          .to(cardRefs.current[2], {
            yPercent: -55,
            rotation: -2,
            ease: "power2.inOut",
            duration: 1
          }, 1)

          // Previous cards scale down
          .to([cardRefs.current[0]], {
            scale: 0.9,
            opacity: 0.8,
            ease: "power2.inOut",
            duration: 0.5
          }, 1)
          .to([cardRefs.current[1]], {
            scale: 0.95,
            opacity: 0.9,
            ease: "power2.inOut",
            duration: 0.5
          }, 1);

        // Scroll indicator animation
        const scrollbarHeight = scrollbarElement.offsetHeight;
        const indicatorHeight = scrollIndicatorElement.offsetHeight;
        const availableTravelHeight = scrollbarHeight - indicatorHeight;
        const INDICATOR_MOTION_PERCENTAGE = 1.0;
        const actualTravelDistance = (availableTravelHeight * INDICATOR_MOTION_PERCENTAGE) / 2;

        gsap.fromTo(scrollIndicatorElement,
          { y: -actualTravelDistance },
          {
            y: actualTravelDistance,
            ease: "power2.inOut",
            duration: 2,
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "+=2000",
              scrub: 1,
            }
          }
        );

        // Force a re-render after animations are set up
        requestAnimationFrame(() => {
          try {
            ScrollTrigger.refresh();
            console.log('ScrollTrigger refreshed successfully');
          } catch (error) {
            console.warn('ScrollTrigger refresh failed:', error);
          }
        });

      } catch (error) {
        console.error('Animation setup failed:', error);
        setIsAnimationsEnabled(false);
      }
    }, section);

    return () => {
      try {
        ctx.revert();
      } catch (error) {
        console.warn('Animation cleanup failed:', error);
      }
    };
  }, [prefersReducedMotion, isAnimationsEnabled]);

return (
  <section
    ref={sectionRef}
    className="w-full min-h-screen flex flex-col items-center justify-center py-4 md:py-8 relative z-10 overflow-hidden"
    style={{ backgroundColor: "#251F1E" }}
  >
    <div className="w-full relative z-20 min-h-[85vh] md:min-h-[1200px]">
      {/* Top Marquee */}
      <div className="absolute top-0 md:-top-4 left-0 w-full overflow-hidden whitespace-nowrap font-extrabold text-neutral-700 pointer-events-none">
        <div
          ref={(el) => {
            marqueeRefs.current[0] = el;
          }}
          className="text-[14vw] sm:text-[10vw] md:text-[7vw] lg:text-[6vw] xl:text-[5.5vw] 2xl:text-[7vw] font-extrabold text-neutral-700 whitespace-nowrap inline-block will-change-transform"
        >
          FIND YOUR VIBE | FIND YOUR VIBE | FIND YOUR VIBE | FIND YOUR VIBE | FIND YOUR VIBE | FIND YOUR VIBE | FIND YOUR VIBE | FIND YOUR VIBE |
        </div>
      </div>

      <div className="relative w-full h-full flex items-center justify-center">
        <div className="relative w-full h-full">
          {cards.map((card, i) => (
            <div
              key={i}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className="absolute left-1/2 top-[50%] md:top-1/2 -translate-x-1/2 -translate-y-1/2 transform-gpu origin-center will-change-transform"
              style={{
                zIndex: 30 + i,
              }}
            >
              <Card
                {...card}
                cardBackgroundColor={CARD_BACKGROUND_COLOR}
                cardBorderColor={CARD_BORDER_COLOR}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Scrollbar - hidden on mobile */}
      <div
        ref={scrollbarRef}
        className="hidden md:flex absolute right-4 md:right-20 top-1/2 -translate-y-1/2 w-1 bg-neutral-700 rounded-full items-center justify-center"
        style={{ height: SCROLLBAR_HEIGHT_PX }}
      >
        <div
          id="scroll-indicator"
          className="absolute h-6 w-6 bg-yellow-400 rounded-full will-change-transform"
        ></div>
      </div>

      {/* Bottom Marquee */}
      <div className="absolute bottom-0  md:-bottom-4 left-0 w-full overflow-hidden whitespace-nowrap font-extrabold text-neutral-700 pointer-events-none">
        <div
          ref={(el) => {
            marqueeRefs.current[1] = el;
          }}
          className="text-[14vw] sm:text-[10vw] md:text-[7vw] lg:text-[6vw] xl:text-[5.5vw] 2xl:text-[7vw] font-extrabold text-neutral-700 whitespace-nowrap inline-block will-change-transform"
        >
          FIND YOUR VIBE | FIND YOUR VIBE | FIND YOUR VIBE | FIND YOUR VIBE | FIND YOUR VIBE | FIND YOUR VIBE | FIND YOUR VIBE | FIND YOUR VIBE |
        </div>
      </div>
    </div>
  </section>
);

};

export default InteractiveCards;