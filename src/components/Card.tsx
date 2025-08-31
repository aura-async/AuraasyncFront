"use client"; // client component because of hooks and motion

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import React from "react";

// Define the types for the component props
type CardProps = {
  title: string;
  description: string;
  imageUrl: string;
  blobUrl: string | null;
  imagePosition: "left" | "right";
  cardBackgroundColor: string;
  cardBorderColor: string;
  link: string;
  className?: string;
};

const Card: React.FC<CardProps> = ({
  title,
  description,
  imageUrl,
  blobUrl,
  imagePosition,
  cardBackgroundColor,
  cardBorderColor,
  link,
  className,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true, margin: "0px 0px -100px 0px" }}
      className={`relative w-[95vw] sm:w-[500px] md:w-[750px] lg:w-[950px] min-h-[550px] rounded-2xl overflow-hidden shadow-2xl p-8 md:p-12 border-2 group-hover:scale-105 transition-transform duration-300 ${className || ""}`}
      style={{
        backgroundColor: cardBackgroundColor,
        borderColor: cardBorderColor,
      }}
    >
      <Link href={link} className="block h-full w-full">
        <div
          className={`flex relative h-full flex-col md:flex-row items-center gap-y-6 md:gap-x-8 ${
            imagePosition === "right" ? "" : "md:flex-row-reverse"
          }`}
        >
          {/* Text Section */}
          <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-white">
              {title}
            </h2>
            <p className="text-base md:text-lg text-neutral-300 mb-8 max-w-full px-4 md:px-0">
              {description}
            </p>
          </div>

          {/* Image Section */}
          <div className="relative w-full md:w-1/2 h-64 md:h-[300px]">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 80vw, (max-width: 1200px) 40vw, 475px"
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default Card;
