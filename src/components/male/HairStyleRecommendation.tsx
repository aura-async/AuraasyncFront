"use client";
import React, { useMemo, useState } from "react";
import Image from "next/image";

// --------------------------------------
// Plug‑and‑Play Hairstyle Recommender
// --------------------------------------
// • Framework: Next.js + React (TS)
// • Styling: TailwindCSS (uses utility classes only)
// • Usage: Drop this file into /components, then import and render
//      <HairstyleRecommender /> anywhere (e.g., in app/hairstyles/page.tsx).
// • Images: Mapped to actual files in app/assets/hair directory
// • Backend hooks: see the optional `fetchAutoFaceShape` function.
// --------------------------------------

// ---- Types ----
export type Gender = "Women" | "Men";
export type FaceShape = "Oval" | "Round" | "Square" | "Heart" | "Diamond" | "Oblong";
export type HairLength = "Short" | "Medium" | "Long";

export interface StyleItem {
  name: string;
  description: string;
  image: string; // path or URL; replace freely
}

export type LengthBuckets = Record<HairLength, StyleItem[]>;
export type ShapeMap = Record<FaceShape, LengthBuckets>;
export type DataMap = Record<Gender, ShapeMap>;

// ---- Config ----
const IMAGE_BASE = "/assets/hair"; // Path to actual hairstyle images in public directory

// Helper to build image paths based on actual file structure
const img = (g: Gender, shape: FaceShape, length: HairLength, styleName: string) => {
  const gender = g === "Men" ? "MEN" : "WOMEN";
  
  // Map face shapes to actual directory names
  const faceShapeMap: Record<FaceShape, string> = {
    "Oval": "OVAL",
    "Round": g === "Women" ? "ROund" : "Round", // WOMEN has typo "ROund"
    "Square": "Square",
    "Heart": "Heart", 
    "Diamond": "Diamond",
    "Oblong": "Oblong"
  };
  
  const faceShape = faceShapeMap[shape];
  
  // Map hair lengths to actual directory names
  const hairLengthMap: Record<HairLength, string> = {
    "Short": g === "Women" && shape === "Round" ? "Small" : "Short", // Only WOMEN Round uses "Small"
    "Medium": "medium", // Actual directory is lowercase "medium"
    "Long": "Long"
  };
  
  const hairLength = hairLengthMap[length];
  
  // Map style names to actual file names
  const styleNameMap: Record<string, string> = {
    // Women Oval Short
    "Pixie Cut": "Pixie Cut",
    "Textured Bob": "Textured Bob", 
    "Asymmetrical Bob": "Asymmetrical Bob",
    "Cropped Shag": "Cropped Shag",
    "Short Blunt Bob": "Short Blunt Bob",
    "Oval Pixie Cut": "Pixie Cut",
    "Oval Textured Bob": "Textured Bob", 
    "Oval Asymmetrical Bob": "Asymmetrical Bob",
    "Oval Cropped Shag": "Cropped Shag",
    "Oval Short Blunt Bob": "Short Blunt Bob",
    
    // Women Oval Medium
    "Long Bob": "Long Bob",
    "Layered Shoulder Cut": "Layered Shoulder Cut",
    "Wavy Mid-Length Cut": "Wavy Mid-Length Cut",
    "Curtain Bangs": "Curtain Bangs",
    "Shag Cut": "Shag Cut",
    "Oval Long Bob": "Long Bob",
    "Oval Layered Shoulder Cut": "Layered Shoulder Cut",
    "Oval Wavy Mid-Length Cut": "Wavy Mid-Length Cut",
    "Oval Curtain Bangs": "Curtain Bangs",
    "Oval Shag Cut": "Shag Cut",
    
    // Women Oval Long
    "Soft Layers": "Soft Layers",
    "Beach Waves": "Beach Waves",
    "Straight Sleek Look": "Straight Sleek Look",
    "Curtain Bangs with Long Layers": "Curtain Bangs with Long Layers",
    "Long Curls": "Long Curls",
    "Face-Framing Layers (long)": "Face-Framing Layers (long)",
    "Oval Soft Layers": "Soft Layers",
    "Oval Beach Waves": "Beach Waves",
    "Oval Straight Sleek Look": "Straight Sleek Look",
    "Oval Curtain Bangs with Long Layers": "Curtain Bangs with Long Layers",
    "Oval Long Curls": "Long Curls",
    "Oval Face-Framing Layers (long)": "Face-Framing Layers (long)",
    
    // Men Oval Short
    "Men Oval Classic Crew Cut": "Classic Crew Cut",
    "Men Oval Buzz Cut": "Buzz Cut",
    "Men Oval Textured Crop": "Textured Crop",
    "Men Oval Ivy League Cut": "Ivy League Cut",
    "Men Oval Caesar Cut": "Caesar Cut",
    
    // Men Oval Medium
    "Men Oval Pompadour": "Pompadour",
    "Men Oval Quiff": "Quiff",
    "Men Oval Side Part": "Side Part",
    "Men Oval Medium Textured Fringe": "Medium Textured Fringe",
    "Men Oval Messy Medium Layers": "Messy Medium Layers",
    
    // Men Oval Long
    "Men Oval Shoulder-Length Straight or Wavy": "Shoulder-Length Straight or Wavy",
    "Men Oval Man Bun": "Man Bun",
    "Men Oval Long Slick Back": "Long Slick Back",
    "Men Oval Wavy Flow (Hockey Hair)": "Wavy Flow (Hockey Hair)",
    "Men Oval Long Layers with Natural Texture": "Long Layers with Natural Texture",
    
    // Women Round Short (uses "Small" directory)
    "Round Angled bob": "Angled Bob",
    "Round Pixie with volume on top": "Pixie with Volume (2)",
    "Round Textured side‑part bob": "Textured Side-Part Bob (2)",
    "Round Asymmetrical Short Cut": "Asymmetrical Short Cut",
    "Round Long pixie with side‑swept bangs": "Long Pixie",
    
    // Women Round Medium
    "Round Shoulder‑length lob": "Shoulder-Length Lob",
    "Round Layered mid‑length cut": "Layered Mid-Length Cut",
    "Round Side‑parted waves": "Side-Parted Waves",
    "Round Medium cut with long side bangs": "Medium Cut with Long Side Bangs",
    "Round Shaggy lob": "Shaggy Lob",
    
    // Women Round Long
    "Round Long layers": "Long Layers",
    "Round Loose waves with side part": "Loose Waves with Side Part",
    "Round Straight sleek hair (center part)": "Straight Sleek Hair",
    "Round Face‑framing layers starting below chin": "Face-Framing Layers",
    "Round Long hair with curtain bangs": "Long Hair with Curtain Bangs",
    "Round V‑shaped or U‑shaped cut": "V-Shaped or U-Shaped Cut",
    
    // Men Round Short
    "Men Round High & Tight Fade": "High & Tight Fade",
    "Men Round Crew Cut with Fade": "Crew Cut with Fade",
    "Men Round Angular Fringe": "Angular Fringe",
    "Men Round Caesar with Texture": "Caesar with Texture",
    "Men Round Short Spiky Top": "Short Spiky Top",
    
    // Men Round Medium
    "Men Round Pompadour with Fade": "Pompadour with Fade",
    "Men Round Textured Quiff": "Textured Quiff",
    "Men Round Side Part with Undercut": "Side Part with Undercut",
    "Men Round Medium Faux Hawk": "Medium Faux Hawk",
    "Men Round Brushed‑up Layers": "Brushed‑up Layers",
    
    // Men Round Medium - Additional mappings
    "brushed-up Layers": "Brushed-up Layers",
    
    // Men Round Long - Updated with actual image names
    "Men Round Long Top + Short Sides (Disconnected)": "Disconnected Undercut",
    "Men Round Shoulder‑length with Side Part": "Shoulder-Length with Side Part",
    "Men Round Slick Back (longer on top)": "Slick Back",
    "Men Round Wavy layers pushed back": "Wavy Layers Pushed Back",
    "Men Round Man Bun / Top Knot (high)": "High Man BunTop Knot",
    
    // Men Square Short
    "Men Square Buzz Cut": "Buzz Cut",
    "Men Square Crew Cut with Fade": "Crew Cut with Fade",
    "Men Square High & Tight": "High & Tight",
    "Men Square Short Spiky Hair": "Short Spiky Hair",
    "Men Square Textured Caesar Cut": "Textured Caesar Cut",
    

    
    // Men Square Medium - Updated with actual image names
    "Men Square Classic Side Part": "Classic Side Part",
    "Men Square Undercut with Volume on Top": "Undercut with Volume on Top",
    "Men Square Textured Quiff": "Textured Quiff",
    "Men Square Pompadour (medium)": "Pompadour (Medium)",
    "Men Square Faux Hawk (controlled sides)": "Faux Hawk (controlled sides)",
    
    // Men Square Medium - Direct mappings
    "Classic Side Part": "Classic Side Part",
    
    // Men Square - Additional mappings for missing images
    "Short hair": "Buzz Cut",
    "Medium hair": "Classic Side Part",
    "Medium side part": "Classic Side Part",
    
    // Men Square Long - Updated with actual image names
    "Men Square Slick Back (longer length)": "Slick Back (Longer Length)",
    "Men Square Shoulder‑Length Waves (pushed back/side part)": "Shoulder-Length Waves",
    "Men Square Layered Long Hair with Fade": "Layered Long Hair with Fade",
    "Men Square Man Bun / Top Knot (tight sides)": "Man BunTop Knot",
    "Men Square Long Flow with Tapered Sides": "Long Flow with Tapered Sides",
    
    // Men Heart Short
    "Men Heart Classic Taper Fade with Texture": "Classic Taper Fade with Texture",
    "Men Heart Crew Cut (Slightly Textured)": "Crew Cut (Slightly Textured)",
    "Men Heart Side Swept Short Cut": "Side Swept Short Cut",
    "Men Heart Low Fade with Brushed Forward Top": "Low Fade with Brushed Forward Top",
    "Men Heart Textured Crop": "Textured Crop",
    
    // Men Heart Medium - Updated with actual image names
    "Men Heart Medium Side Part with Layers": "Medium Side Part with Layers",
    "Men Heart Light Fringe / Forward Bangs": "Light FringeForward Bangs",
    "Men Heart Textured Quiff (not too high)": "Textured Quiff (Not Too High)",
    "Men Heart Messy Medium Hair": "Messy Medium Hair",
    "Men Heart Medium Undercut with Flow": "Medium Undercut with Flow",
    
    // Men Heart Long - Updated with actual image names
    "Men Heart Wavy Shoulder‑Length Hair": "Wavy Shoulder-Length Hair",
    "Men Heart Layered Long Hair (messy look)": "Layered long hair (Messy look)",
    "Men Heart Man Bun with Loose Strands": "Man Bun with Loose Strands",
    "Men Heart Long Fringe with Layers": "Long Fringe with Layer",
    "Men Heart Chin‑Length Flow (bold look)": "Chin-Length BobFlow",
    
    // Men Diamond Short
    "Men Diamond Classic Caesar Cut": "Classic Caesar Cut",
    "Men Diamond Crew Cut with Texture": "Crew Cut with Texture",
    "Men Diamond Short Side Swept Fringe": "Short Side Swept Fringe",
    "Men Diamond Low Fade with Brushed Forward Top": "Low Fade with Brushed Forward Top",
    "Men Diamond Buzz Cut (with Beard)": "Buzz Cut (with Beard)",
    
    // Men Diamond Medium - Updated with actual image names
    "Men Diamond Medium Side Part with Layers": "Side Part with Layers",
    "Men Diamond Textured Quiff (not too high)": "Medium Quiff (Not Too Tall)",
    "Men Diamond Medium Undercut with Flow": "Undercut with Medium Top",
    "Men Diamond Light Fringe / Forward Bangs": "Textured Crop with Fringe",
    "Men Diamond Messy Medium Hair": "Messy Medium Waves",
    
    // Men Diamond Long - Updated with actual image names
    "Men Diamond Wavy Shoulder‑Length Hair": "Shoulder-Length Waves",
    "Men Diamond Layered Long Hair (messy look)": "Layered Long Hair",
    "Men Diamond Man Bun with Loose Strands": "Man Bun  Top Knot",
    "Men Diamond Long Fringe with Layers": "Long Side-Swept Hair",
    "Men Diamond Chin‑Length Flow (bold look)": "Long Curly Hair",
    
    // Men Oblong Short - Updated with actual image names
    "Men Oblong Crew Cut": "Crew Cut",
    "Men Oblong Buzz Cut": "Buzz Cut",
    "Men Oblong Short Textured Crop with Fringe": "Short Textured Crop with Fringe",
    "Men Oblong Low Fade with Short Comb Over": "Low Fade with Short Comb Over",
    "Men Oblong Ivy League Cut": "Ivy League Cut",
    
    // Men Oblong Medium - Updated with actual image names
    "Men Oblong Classic Side Part": "Classic Side Part",
    "Men Oblong Textured Quiff (not too high)": "Textured Quiff",
    "Men Oblong Medium Undercut with Flow": "Medium-Length Layers",
    "Men Oblong Light Fringe / Forward Bangs": "Side Swept Fringe",
    "Men Oblong Messy Medium Hair": "Brushed Back with Natural Waves",
    
    // Men Oblong Long - Updated with actual image names
    "Men Oblong Wavy Shoulder‑Length Hair": "Shoulder-Length Waves",
    "Men Oblong Layered Long Hair (messy look)": "Layered Long Hair",
    "Men Oblong Man Bun with Loose Strands": "Man Bun (Low)",
    "Men Oblong Long Fringe with Layers": "Long Hair with Side Part",
    "Men Oblong Chin‑Length Flow (bold look)": "Loose Natural CurlsWaves",
    
    // Women Heart Short
    "Side‑parted pixie": "Side-Parted Pixie",
    "Wavy bob": "Wavy Bob",
    "Asymmetrical bob": "Asymmetrical Bob",
    "Chin‑length layered bob": "Chin-Length Layered Bob",
    "Pixie with long side bangs": "Pixie with Long Side Bangs",
    "Heart Side‑parted pixie": "Side-Parted Pixie",
    "Heart Wavy bob": "Wavy Bob",
    "Heart Asymmetrical bob": "Asymmetrical Bob",
    "Heart Chin‑length layered bob": "Chin-Length Layered Bob",
    "Heart Pixie with long side bangs": "Pixie with Long Side Bangs",
    
    // Women Heart Medium
    "Heart Collarbone cut with soft waves": "Collarbone Cut with Soft Waves",
    "Heart Shoulder‑length lob with layers": "Shoulder lenght lob with Layers", // Note: actual file has typo "lenght"
    "Heart Medium cut with curtain bangs": "Medium Cut with Curtain Bangs",
    "Heart Shaggy mid‑length style": "Shaggy Mid-Length Style",
    "Heart Side‑swept bangs + medium layers": "Side-Swept Bangs with Medium Layers",
    
    // Women Heart Long
    "Heart Long layers with waves/curls": "Long Layers with WavesCurls",
    "Heart Loose curls starting below chin": "Loose Curls Starting Below Chin",
    "Heart Face‑framing layers": "Face-Framing Layers",
    "Heart Long hair with curtain bangs": "Long Hair with Curtain Bangs",
    "Heart Side‑parted long cut": "Side-Parted Long Cut",
    "Heart V‑cut or U‑cut with soft waves": "V-Cut or U-Cut with Soft Waves",
    
    // Women Heart Long - Direct mappings
    "Long Layers with WavesCurls": "Long Layers with WavesCurls",
    "Loose Curls Starting Below Chin": "Loose Curls Starting Below Chin",
    "Face-Framing Layers": "Face-Framing Layers",
    
    // Women Heart Long - Additional mappings
    "Long hair": "Long Hair with Curtain Bangs",
    "Face-framing layers": "Face-Framing Layers",
    "Losse curls starting below chin": "Loose Curls Starting Below Chin",
    
    // Women Heart Long - Additional mappings for missing images
    "Long hair with curtain bangs": "Long Hair with Curtain Bangs",
    "Face‑framing layers": "Face-Framing Layers",
    "Loose curls starting below chin": "Loose Curls Starting Below Chin",
    
    // Women Diamond Short
    "Diamond Textured bob": "Textured Bob",
    "Diamond Side‑parted bob": "Side-Parted Bob",
    "Diamond Pixie with side‑swept bangs": "Pixie with Side-Swept Bangs",
    "Diamond Wavy asymmetrical bob": "Wavy Asymmetrical Bob",
    "Diamond Chin‑length layered bob": "Chin-Length Layered Bob",
    
    // Women Diamond Medium - Updated with actual image names
    "Diamond Shoulder‑length layers": "Shoulder-Length Lob with Layers",
    "Diamond Medium cut with curtain bangs": "Curtain Bangs with Medium Layers",
    "Diamond Shag cut": "Shaggy Mid-Cut",
    "Diamond Side‑parted waves": "Wavy Mid-Length Cut",
    "Diamond Medium cut with side‑swept bangs": "Side-Swept Medium Cut",
    
    // Women Diamond Long - Updated with actual image names
    "Diamond Long layers with waves": "Long Layers with WavesCurls",
    "Diamond Face‑framing layers": "Face-Framing Layers",
    "Diamond Long hair with curtain bangs": "Curtain Bangs + Long Layers",
    "Diamond Side‑parted long cut": "Side-Parted Long Style",
    "Diamond Loose curls starting below chin": "Loose Curls Starting Below Chin",
    "Diamond V‑cut or U‑cut with soft waves": "V-Cut or U-Cut with Soft Waves",
    
    // Women Square Short
    "Square Soft pixie with side‑swept fringe": "Soft Pixie",
    "Square Side‑parted bob": "Side-Parted Bob",
    "Square Wavy lob": "Wavy Lob (Long Bob)",
    "Square Textured bob": "Textured Bob",
    "Asymmetrical Short Cut": "Asymmetrical Short Cut",
    
    // Women Square Short - Additional mappings for missing images
    "textured bob": "Textured Bob",
    "Asymmetrical short cut": "Asymmetrical Short Cut",
  
    
    // Women Square Medium
    "Square Shoulder‑length layers": "Shoulder-Length Layers",
    "Square Lob with side‑swept bangs": "Lob with Side-Swept Bangs",
    "Square Soft curls/waves": "Soft CurlsWaves",
    "Square Shag cut": "Shag Cut",
    "Square Medium cut with curtain bangs": "Medium Cut with Curtain Bang",
    
    // Women Square Medium - Additional mappings for missing images
    "Shag cut": "Shag Cut",
    
    // Women Square Long
    "Square Long layers with waves": "Long Layers with Waves",
    "Square Loose curls (below chin)": "Loose Curls",
    "Square Side‑part long hair": "Side-Part Long Hair",
    "Square Layered V‑cut or U‑cut": "Layered V-Cut or U-Cut",
    "Square Long curtain bangs + layers": "Long Curtain Bangs with Layers",
    "Square Beach waves (center part)": "Beach Waves with Center Part",
    
    // Women Oblong Short - Updated with actual image names
    "Oblong Pixie cut": "Pixie with Side-Swept Bangs",
    "Oblong Textured bob": "Soft layered bob",
    "Oblong Side‑parted bob": "Side parted bob with volume",
    "Oblong Asymmetrical bob": "Curled Short Bob",
    "Oblong Short blunt bob": "Chin-Length Bob with Waves",
    
    // Women Oblong Medium - Updated with actual image names
    "Oblong Shoulder‑length layers": "Shoulder-Length Waves",
    "Oblong Medium cut with bangs": "Curtain Bangs with Mid-Length Cut",
    "Oblong Shag cut": "Wavy Shag Cut",
    "Oblong Side‑parted waves": "Side-Swept Bangs with Medium Waves",
    "Oblong Medium cut with side‑swept bangs": "Medium Lob with Layers",
    
    // Women Oblong Long - Updated with actual image names
    "Oblong Long layers with waves": "Long Layers with WavesCurls",
    "Oblong Face‑framing layers": "Face-Framing Layers (Cheek-Level)",
    "Oblong Long hair with bangs": "Curtain Bangs with Long Cut",
    "Oblong Side‑parted long cut": "Long Hair with Side Part",
    "Oblong Loose curls": "Loose Curls at Chin & Cheeks",
    "Oblong V‑cut or U‑cut with waves": "V-Cut with Waves",
    
    // Men Oval Short
    "Classic Crew Cut": "Classic Crew Cut",
    "Buzz Cut": "Buzz Cut",
    "Textured Crop": "Textured Crop",
    "Ivy League Cut": "Ivy League Cut",
    "Caesar Cut": "Caesar Cut",
    
    // Men Oval Medium
    "Pompadour": "Pompadour",
    "Quiff": "Quiff",
    "Side Part": "Side Part",
    "Medium Textured Fringe": "Medium Textured Fringe",
    "Messy Medium Layers": "Messy Medium Layers",
    
    // Men Oval Long
    "Shoulder-Length Straight or Wavy": "Shoulder-Length Straight or Wavy",
    "Man Bun": "Man Bun",
    "Long Slick Back": "Long Slick Back",
    "Wavy Flow (Hockey Hair)": "Wavy Flow (Hockey Hair)",
    "Long Layers with Natural Texture": "Long Layers with Natural Texture",
  };
  
  // Try to find the exact match first, then try case-insensitive match
  let fileName = styleNameMap[styleName];
  
  if (!fileName) {
    // Try case-insensitive match
    const lowerStyleName = styleName.toLowerCase();
    for (const [key, value] of Object.entries(styleNameMap)) {
      if (key.toLowerCase() === lowerStyleName) {
        fileName = value;
        break;
      }
    }
  }
  
  // If still no match, use the original style name
  fileName = fileName || styleName;
  
  return `${IMAGE_BASE}/${gender}/${faceShape}/${hairLength}/${fileName}.jpg`;
};

// ---- Data ----
// Source: Internal AuraaSync haircut recommendation spec (transcribed).
// Images mapped to actual files in app/assets/hair directory
const DATA: DataMap = {
  Women: {
    Oval: {
      Short: [
        { name: "Pixie Cut", description: "Classic or with long side‑swept bangs.", image: img("Women", "Oval", "Short", "Oval Pixie Cut") },
        { name: "Textured Bob", description: "Chin‑length with light waves.", image: img("Women", "Oval", "Short", "Oval Textured Bob") },
        { name: "Asymmetrical Bob", description: "Longer in front, shorter in back.", image: img("Women", "Oval", "Short", "Oval Asymmetrical Bob") },
        { name: "Cropped Shag", description: "Adds volume and movement.", image: img("Women", "Oval", "Short", "Oval Cropped Shag") },
        { name: "Short Blunt Bob", description: "Jawline‑grazing, sharp & chic.", image: img("Women", "Oval", "Short", "Oval Short Blunt Bob") },
      ],
      Medium: [
        { name: "Long Bob", description: "Sleek or wavy, shoulder‑grazing.", image: img("Women", "Oval", "Medium", "Oval Long Bob") },
        { name: "Layered Shoulder Cut", description: "Face‑framing layers to highlight cheekbones.", image: img("Women", "Oval", "Medium", "Oval Layered Shoulder Cut") },
        { name: "Wavy Mid-Length Cut", description: "Effortless—softens features.", image: img("Women", "Oval", "Medium", "Oval Wavy Mid-Length Cut") },
        { name: "Curtain Bangs", description: "Balances oval proportions.", image: img("Women", "Oval", "Medium", "Oval Curtain Bangs") },
        { name: "Shag Cut", description: "Layers + texture for a trendy look.", image: img("Women", "Oval", "Medium", "Oval Shag Cut") },
      ],
      Long: [
        { name: "Soft Layers", description: "Adds movement without overpowering length.", image: img("Women", "Oval", "Long", "Oval Soft Layers") },
        { name: "Beach Waves", description: "Casual, highlights natural symmetry.", image: img("Women", "Oval", "Long", "Oval Beach Waves") },
        { name: "Straight Sleek Look", description: "Middle part; elegant and elongating.", image: img("Women", "Oval", "Long", "Oval Straight Sleek Look") },
        { name: "Curtain Bangs with Long Layers", description: "Balances forehead; flatters oval.", image: img("Women", "Oval", "Long", "Oval Curtain Bangs with Long Layers") },
        { name: "Long Curls", description: "Romantic, adds softness.", image: img("Women", "Oval", "Long", "Oval Long Curls") },
        { name: "Face-Framing Layers (long)", description: "Highlight jawline and cheekbones.", image: img("Women", "Oval", "Long", "Oval Face-Framing Layers (long)") },
      ],
    },
    Round: {
      Short: [
        { name: "Angled bob", description: "Longer in front, shorter in back—sharpens jawline.", image: img("Women", "Round", "Short", "Round Angled bob") },
        { name: "Pixie with volume on top", description: "Elongates face; avoid too round cuts.", image: img("Women", "Round", "Short", "Round Pixie with volume on top") },
        { name: "Textured side‑part bob", description: "Breaks symmetry, adds angles.", image: img("Women", "Round", "Short", "Round Textured side‑part bob") },
        { name: "Asymmetrical short cut", description: "Uneven lengths slim the face.", image: img("Women", "Round", "Short", "Round Asymmetrical short cut") },
        { name: "Long pixie with side‑swept bangs", description: "Adds diagonal lines.", image: img("Women", "Round", "Short", "Round Long pixie with side‑swept bangs") },
      ],
      Medium: [
        { name: "Shoulder‑length lob", description: "Slightly below chin; elongates face.", image: img("Women", "Round", "Medium", "Round Shoulder‑length lob") },
        { name: "Layered mid‑length cut", description: "Soft layers that start below chin.", image: img("Women", "Round", "Medium", "Round Layered mid‑length cut") },
        { name: "Side‑parted waves", description: "Adds dimension; breaks roundness.", image: img("Women", "Round", "Medium", "Round Side‑parted waves") },
        { name: "Medium cut with long side bangs", description: "Creates angles; draws eyes diagonally.", image: img("Women", "Round", "Medium", "Round Medium cut with long side bangs") },
        { name: "Shaggy lob", description: "Volume on crown; texture around jawline.", image: img("Women", "Round", "Medium", "Round Shaggy lob") },
      ],
      Long: [
        { name: "Long layers", description: "Add vertical lines; slimming effect.", image: img("Women", "Round", "Long", "Round Long layers") },
        { name: "Loose waves with side part", description: "Softens fullness, keeps length.", image: img("Women", "Round", "Long", "Round Loose waves with side part") },
        { name: "Straight sleek hair (center part)", description: "Slims face width.", image: img("Women", "Round", "Long", "Round Straight sleek hair (center part)") },
        { name: "Face‑framing layers starting below chin", description: "Avoid cheek‑level layers.", image: img("Women", "Round", "Long", "Round Face‑framing layers starting below chin") },
        { name: "Long hair with curtain bangs", description: "Opens up face; elongates vertically.", image: img("Women", "Round", "Long", "Round Long hair with curtain bangs") },
        { name: "V‑shaped or U‑shaped cut", description: "Lengthens the face visually.", image: img("Women", "Round", "Long", "Round V‑shaped or U‑shaped cut") },
      ],
    },
    Square: {
      Short: [
        { name: "Textured Bob", description: "Jaw‑length or slightly longer; waves soften.", image: img("Women", "Square", "Short", "Textured Bob") },
        { name: "Side‑parted bob", description: "Diagonal line breaks jaw symmetry.", image: img("Women", "Square", "Short", "Square Side‑parted bob") },
        { name: "Wavy lob", description: "Hits below jaw; draws attention downward.", image: img("Women", "Square", "Short", "Square Wavy lob") },
        { name: "Soft pixie with side‑swept fringe", description: "Rounds out angles.", image: img("Women", "Square", "Short", "Square Soft pixie with side‑swept fringe") },
        { name: "Asymmetrical Short Cut", description: "Longer front pieces distract from jaw.", image: img("Women", "Square", "Short", "Square Asymmetrical Short Cut") },
      ],
      Medium: [
        { name: "Shoulder‑length layers", description: "Soft layers beginning below jawline.", image: img("Women", "Square", "Medium", "Square Shoulder‑length layers") },
        { name: "Lob with side‑swept bangs", description: "Reduces squareness; adds curves.", image: img("Women", "Square", "Medium", "Square Lob with side‑swept bangs") },
        { name: "Shag Cut", description: "Texture + volume soften face.", image: img("Women", "Square", "Medium", "Shag Cut") },
        { name: "Soft curls/waves", description: "Avoid sharp straight lines near jaw.", image: img("Women", "Square", "Medium", "Square Soft curls/waves") },
        { name: "Medium cut with curtain bangs", description: "Adds roundness; balances jaw.", image: img("Women", "Square", "Medium", "Square Medium cut with curtain bangs") },
      ],
      Long: [
        { name: "Long layers with waves", description: "Draws eye downward; softens angles.", image: img("Women", "Square", "Long", "Square Long layers with waves") },
        { name: "Loose curls (below chin)", description: "Adds width lower down, away from jaw.", image: img("Women", "Square", "Long", "Square Loose curls (below chin)") },
        { name: "Side‑part long hair", description: "Breaks symmetry of strong lines.", image: img("Women", "Square", "Long", "Square Side‑part long hair") },
        { name: "Layered V‑cut or U‑cut", description: "Elongates; softens boxiness.", image: img("Women", "Square", "Long", "Square Layered V‑cut or U‑cut") },
        { name: "Long curtain bangs + layers", description: "Gently frames face.", image: img("Women", "Square", "Long", "Square Long curtain bangs + layers") },
        { name: "Beach waves (center part)", description: "Slim yet soft look.", image: img("Women", "Square", "Long", "Square Beach waves (center part)") },
      ],
    },
    Heart: {
      Short: [
        { name: "Side‑parted pixie", description: "Softens wide forehead; shifts focus diagonally.", image: img("Women", "Heart", "Short", "Heart Side‑parted pixie") },
        { name: "Wavy bob", description: "Chin‑length waves add volume near jawline.", image: img("Women", "Heart", "Short", "Heart Wavy bob") },
        { name: "Asymmetrical bob", description: "Draws attention away from forehead.", image: img("Women", "Heart", "Short", "Heart Asymmetrical bob") },
        { name: "Chin‑length layered bob", description: "Fills out narrow chin area.", image: img("Women", "Heart", "Short", "Heart Chin‑length layered bob") },
        { name: "Pixie with long side bangs", description: "Balances forehead width.", image: img("Women", "Heart", "Short", "Heart Pixie with long side bangs") },
      ],
      Medium: [
        { name: "Collarbone cut with soft waves", description: "Adds fullness below chin.", image: img("Women", "Heart", "Medium", "Heart Collarbone cut with soft waves") },
        { name: "Shoulder‑length lob with layers", description: "Balances proportions.", image: img("Women", "Heart", "Medium", "Heart Shoulder‑length lob with layers") },
        { name: "Medium cut with curtain bangs", description: "Softens wide forehead; adds flow.", image: img("Women", "Heart", "Medium", "Heart Medium cut with curtain bangs") },
        { name: "Shaggy mid‑length style", description: "Volume throughout, not just top.", image: img("Women", "Heart", "Medium", "Heart Shaggy mid‑length style") },
        { name: "Side‑swept bangs + medium layers", description: "Distracts from forehead.", image: img("Women", "Heart", "Medium", "Heart Side‑swept bangs + medium layers") },
      ],
      Long: [
        { name: "Long layers with waves/curls", description: "Softens pointed chin; adds body.", image: img("Women", "Heart", "Long", "Long Layers with WavesCurls") },
        { name: "Loose curls starting below chin", description: "Balances narrow lower face.", image: img("Women", "Heart", "Long", "Loose Curls Starting Below Chin") },
        { name: "Face‑framing layers", description: "Draw attention to cheekbones.", image: img("Women", "Heart", "Long", "Face-Framing Layers") },
        { name: "Long hair with curtain bangs", description: "Reduces forehead width; elongates.", image: img("Women", "Heart", "Long", "Heart Long hair with curtain bangs") },
        { name: "Side‑parted long cut", description: "Breaks symmetry; shifts focus.", image: img("Women", "Heart", "Long", "Heart Side‑parted long cut") },
        { name: "V‑cut or U‑cut with soft waves", description: "Adds movement; balance.", image: img("Women", "Heart", "Long", "Heart V‑cut or U‑cut with soft waves") },
      ],
    },
    Diamond: {
      Short: [
        { name: "Textured bob", description: "Chin‑length with soft waves to add balance.", image: img("Women", "Diamond", "Short", "Diamond Textured bob") },
        { name: "Side‑parted bob", description: "Breaks sharp cheekbone width.", image: img("Women", "Diamond", "Short", "Diamond Side‑parted bob") },
        { name: "Pixie with side‑swept bangs", description: "Adds volume at forehead; softens angles.", image: img("Women", "Diamond", "Short", "Diamond Pixie with side‑swept bangs") },
        { name: "Wavy asymmetrical bob", description: "Draws attention downward.", image: img("Women", "Diamond", "Short", "Diamond Wavy asymmetrical bob") },
        { name: "Chin‑length layered bob", description: "Fills out jawline.", image: img("Women", "Diamond", "Short", "Diamond Chin‑length layered bob") },
      ],
      Medium: [
        { name: "Shoulder‑length layers", description: "Soft layers that start below cheekbones.", image: img("Women", "Diamond", "Medium", "Diamond Shoulder‑length layers") },
        { name: "Medium cut with curtain bangs", description: "Softens wide cheekbones.", image: img("Women", "Diamond", "Medium", "Diamond Medium cut with curtain bangs") },
        { name: "Shag cut", description: "Texture throughout; avoids sharp lines.", image: img("Women", "Diamond", "Medium", "Diamond Shag cut") },
        { name: "Side‑parted waves", description: "Breaks symmetry; adds dimension.", image: img("Women", "Diamond", "Medium", "Diamond Side‑parted waves") },
        { name: "Medium cut with side‑swept bangs", description: "Reduces cheekbone width.", image: img("Women", "Diamond", "Medium", "Diamond Medium cut with side‑swept bangs") },
      ],
      Long: [
        { name: "Long layers with waves", description: "Softens angles; adds movement.", image: img("Women", "Diamond", "Long", "Diamond Long layers with waves") },
        { name: "Face‑framing layers", description: "Draws attention to jawline.", image: img("Women", "Diamond", "Long", "Diamond Face‑framing layers") },
        { name: "Long hair with curtain bangs", description: "Softens cheekbones; elongates.", image: img("Women", "Diamond", "Long", "Diamond Long hair with curtain bangs") },
        { name: "Side‑parted long cut", description: "Breaks symmetry; shifts focus.", image: img("Women", "Diamond", "Long", "Diamond Side‑parted long cut") },
        { name: "Loose curls starting below chin", description: "Adds fullness near jawline.", image: img("Women", "Diamond", "Long", "Diamond Loose curls starting below chin") },
        { name: "V‑cut or U‑cut with soft waves", description: "Elongates; softens angles.", image: img("Women", "Diamond", "Long", "Diamond V‑cut or U‑cut with soft waves") },
      ],
    },
    Oblong: {
      Short: [
        { name: "Pixie cut", description: "Adds width; avoid too much height.", image: img("Women", "Oblong", "Short", "Oblong Pixie cut") },
        { name: "Textured bob", description: "Chin‑length with waves to add width.", image: img("Women", "Oblong", "Short", "Oblong Textured bob") },
        { name: "Side‑parted bob", description: "Breaks vertical lines.", image: img("Women", "Oblong", "Short", "Oblong Side‑parted bob") },
        { name: "Asymmetrical bob", description: "Adds interest; breaks length.", image: img("Women", "Oblong", "Short", "Oblong Asymmetrical bob") },
        { name: "Short blunt bob", description: "Adds width; avoids elongation.", image: img("Women", "Oblong", "Short", "Oblong Short blunt bob") },
      ],
      Medium: [
        { name: "Shoulder‑length layers", description: "Adds width; avoids too much length.", image: img("Women", "Oblong", "Medium", "Oblong Shoulder‑length layers") },
        { name: "Medium cut with bangs", description: "Reduces forehead height.", image: img("Women", "Oblong", "Medium", "Oblong Medium cut with bangs") },
        { name: "Shag cut", description: "Adds texture and width.", image: img("Women", "Oblong", "Medium", "Oblong Shag cut") },
        { name: "Side‑parted waves", description: "Breaks vertical lines.", image: img("Women", "Oblong", "Medium", "Oblong Side‑parted waves") },
        { name: "Medium cut with side‑swept bangs", description: "Reduces length; adds width.", image: img("Women", "Oblong", "Medium", "Oblong Medium cut with side‑swept bangs") },
      ],
      Long: [
        { name: "Long layers with waves", description: "Adds width; avoids too much length.", image: img("Women", "Oblong", "Long", "Oblong Long layers with waves") },
        { name: "Face‑framing layers", description: "Adds width near face.", image: img("Women", "Oblong", "Long", "Oblong Face‑framing layers") },
        { name: "Long hair with bangs", description: "Reduces forehead height.", image: img("Women", "Oblong", "Long", "Oblong Long hair with bangs") },
        { name: "Side‑parted long cut", description: "Breaks vertical lines.", image: img("Women", "Oblong", "Long", "Oblong Side‑parted long cut") },
        { name: "Loose curls", description: "Adds width; avoids elongation.", image: img("Women", "Oblong", "Long", "Oblong Loose curls") },
        { name: "V‑cut or U‑cut with waves", description: "Adds width; avoids too much length.", image: img("Women", "Oblong", "Long", "Oblong V‑cut or U‑cut with waves") },
      ],
    },
  },
  Men: {
    Oval: {
      Short: [
        { name: "Classic Crew Cut", description: "Neat, balanced, timeless.", image: img("Men", "Oval", "Short", "Men Oval Classic Crew Cut") },
        { name: "Buzz Cut", description: "Keeps proportions clean.", image: img("Men", "Oval", "Short", "Men Oval Buzz Cut") },
        { name: "Textured Crop", description: "Short with texture; modern look.", image: img("Men", "Oval", "Short", "Men Oval Textured Crop") },
        { name: "Ivy League Cut", description: "Short sides, slightly longer top.", image: img("Men", "Oval", "Short", "Men Oval Ivy League Cut") },
        { name: "Caesar Cut", description: "Structured but not too heavy.", image: img("Men", "Oval", "Short", "Men Oval Caesar Cut") },
      ],
      Medium: [
        { name: "Pompadour", description: "Volume on top; tapered sides.", image: img("Men", "Oval", "Medium", "Men Oval Pompadour") },
        { name: "Quiff", description: "Casual; lifted style adds height.", image: img("Men", "Oval", "Medium", "Men Oval Quiff") },
        { name: "Side Part", description: "Neat, business‑ready; shows balance.", image: img("Men", "Oval", "Medium", "Men Oval Side Part") },
        { name: "Medium Textured Fringe", description: "Works if kept light.", image: img("Men", "Oval", "Medium", "Men Oval Medium Textured Fringe") },
        { name: "Messy Medium Layers", description: "Natural, relaxed.", image: img("Men", "Oval", "Medium", "Men Oval Messy Medium Layers") },
      ],
      Long: [
        { name: "Shoulder-Length Straight or Wavy", description: "Shows off symmetry.", image: img("Men", "Oval", "Long", "Men Oval Shoulder-Length Straight or Wavy") },
        { name: "Man Bun", description: "Pulls face upward; elongates slightly.", image: img("Men", "Oval", "Long", "Men Oval Man Bun") },
        { name: "Long Slick Back", description: "Stylish; keeps face balanced.", image: img("Men", "Oval", "Long", "Men Oval Long Slick Back") },
        { name: "Wavy Flow (Hockey Hair)", description: "Relaxed; frames evenly.", image: img("Men", "Oval", "Long", "Men Oval Wavy Flow (Hockey Hair)") },
        { name: "Long Layers with Natural Texture", description: "Keeps proportions open.", image: img("Men", "Oval", "Long", "Men Oval Long Layers with Natural Texture") },
      ],
    },
    Round: {
      Short: [
        { name: "High & Tight Fade", description: "Sharp sides; adds length.", image: img("Men", "Round", "Short", "Men Round High & Tight Fade") },
        { name: "Crew Cut with Fade", description: "Clean and structured.", image: img("Men", "Round", "Short", "Men Round Crew Cut with Fade") },
        { name: "Angular Fringe (not straight)", description: "Angles break roundness.", image: img("Men", "Round", "Short", "Men Round Angular Fringe") },
        { name: "Caesar with Texture", description: "Short fringe, styled up/forward.", image: img("Men", "Round", "Short", "Men Round Caesar with Texture") },
        { name: "Short Spiky Top", description: "Creates vertical lift.", image: img("Men", "Round", "Short", "Men Round Short Spiky Top") },
      ],
      Medium: [
        { name: "Pompadour with Fade", description: "Adds height; elongates face.", image: img("Men", "Round", "Medium", "Men Round Pompadour with Fade") },
        { name: "Textured Quiff", description: "Volume at front balances width.", image: img("Men", "Round", "Medium", "Men Round Textured Quiff") },
        { name: "Side Part with Undercut", description: "Sharp contrast slims face.", image: img("Men", "Round", "Medium", "Men Round Side Part with Undercut") },
        { name: "Medium Faux Hawk", description: "Elongates vertically.", image: img("Men", "Round", "Medium", "Men Round Medium Faux Hawk") },
        { name: "Brushed‑up Layers", description: "Messy height on top.", image: img("Men", "Round", "Medium", "Brushed-up Layers") },
      ],
      Long: [
        { name: "Long Top + Short Sides (Disconnected)", description: "Makes face appear longer.", image: img("Men", "Round", "Long", "Men Round Long Top + Short Sides (Disconnected)") },
        { name: "Shoulder‑length with Side Part", description: "Breaks symmetry.", image: img("Men", "Round", "Long", "Men Round Shoulder‑length with Side Part") },
        { name: "Slick Back (longer on top)", description: "Elongates vertically.", image: img("Men", "Round", "Long", "Men Round Slick Back (longer on top)") },
        { name: "Wavy layers pushed back", description: "Adds height; avoids width.", image: img("Men", "Round", "Long", "Men Round Wavy layers pushed back") },
        { name: "Man Bun / Top Knot (high)", description: "Maximizes vertical length.", image: img("Men", "Round", "Long", "Men Round Man Bun / Top Knot (high)") },
      ],
    },
    Square: {
      Short: [
        { name: "Buzz Cut", description: "Emphasizes masculine jawline.", image: img("Men", "Square", "Short", "Buzz Cut") },
        { name: "Crew Cut with Fade", description: "Clean, sharp edges.", image: img("Men", "Square", "Short", "Men Square Crew Cut with Fade") },
        { name: "High & Tight", description: "Military‑style; neat and bold.", image: img("Men", "Square", "Short", "Men Square High & Tight") },
        { name: "Short Spiky Hair", description: "Adds texture; neat sides.", image: img("Men", "Square", "Short", "Men Square Short Spiky Hair") },
        { name: "Textured Caesar Cut", description: "Slight forward fringe; adds detail.", image: img("Men", "Square", "Short", "Men Square Textured Caesar Cut") },
      ],
      Medium: [
        { name: "Classic Side Part", description: "Timeless; highlights structure.", image: img("Men", "Square", "Medium", "Classic Side Part") },
        { name: "Undercut with Volume on Top", description: "Contrast balances sharp jawline.", image: img("Men", "Square", "Medium", "Men Square Undercut with Volume on Top") },
        { name: "Textured Quiff", description: "Adds lift; balances proportions.", image: img("Men", "Square", "Medium", "Men Square Textured Quiff") },
        { name: "Pompadour (medium)", description: "Bold, sharp with volume.", image: img("Men", "Square", "Medium", "Men Square Pompadour (medium)") },
        { name: "Faux Hawk (controlled sides)", description: "Elongates face.", image: img("Men", "Square", "Medium", "Men Square Faux Hawk (controlled sides)") },
      ],
      Long: [
        { name: "Slick Back (longer length)", description: "Structured, masculine.", image: img("Men", "Square", "Long", "Men Square Slick Back (longer length)") },
        { name: "Shoulder‑Length Waves (pushed back/side part)", description: "Rugged but neat.", image: img("Men", "Square", "Long", "Men Square Shoulder‑Length Waves (pushed back/side part)") },
        { name: "Layered Long Hair with Fade", description: "Modern masculine vibe.", image: img("Men", "Square", "Long", "Men Square Layered Long Hair with Fade") },
        { name: "Man Bun / Top Knot (tight sides)", description: "Keeps definition strong.", image: img("Men", "Square", "Long", "Men Square Man Bun / Top Knot (tight sides)") },
        { name: "Long Flow with Tapered Sides", description: "Adds balance; avoids boxy look.", image: img("Men", "Square", "Long", "Men Square Long Flow with Tapered Sides") },
      ],
    },
    Heart: {
      Short: [
        { name: "Classic Taper Fade + Texture Top", description: "Balances forehead.", image: img("Men", "Heart", "Short", "Men Heart Classic Taper Fade with Texture") },
        { name: "Crew Cut (slightly textured)", description: "Clean; not too flat.", image: img("Men", "Heart", "Short", "Men Heart Crew Cut (Slightly Textured)") },
        { name: "Side‑Swept Short Cut", description: "Softens forehead width.", image: img("Men", "Heart", "Short", "Men Heart Side Swept Short Cut") },
        { name: "Low Fade + Brushed Forward Top", description: "Adds balance.", image: img("Men", "Heart", "Short", "Men Heart Low Fade with Brushed Forward Top") },
        { name: "Textured Crop", description: "Fringe helps reduce broad‑forehead appearance.", image: img("Men", "Heart", "Short", "Men Heart Textured Crop") },
      ],
      Medium: [
        { name: "Medium Side Part with Layers", description: "Reduces width at temples.", image: img("Men", "Heart", "Medium", "Men Heart Medium Side Part with Layers") },
        { name: "Light Fringe / Forward Bangs", description: "Balances big forehead.", image: img("Men", "Heart", "Medium", "Men Heart Light Fringe / Forward Bangs") },
        { name: "Textured Quiff (not too high)", description: "Adds dimension without excess height.", image: img("Men", "Heart", "Medium", "Men Heart Textured Quiff (not too high)") },
        { name: "Messy Medium Hair", description: "Casual volume softens face.", image: img("Men", "Heart", "Medium", "Men Heart Messy Medium Hair") },
        { name: "Medium Undercut with Flow", description: "Stylish; draws attention away from chin.", image: img("Men", "Heart", "Medium", "Men Heart Medium Undercut with Flow") },
      ],
      Long: [
        { name: "Wavy Shoulder‑Length Hair", description: "Adds fullness near jawline.", image: img("Men", "Heart", "Long", "Men Heart Wavy Shoulder‑Length Hair") },
        { name: "Layered Long Hair (messy look)", description: "Makes chin look stronger.", image: img("Men", "Heart", "Long", "Men Heart Layered Long Hair (messy look)") },
        { name: "Man Bun with Loose Strands", description: "Stylish; balances sharp forehead.", image: img("Men", "Heart", "Long", "Men Heart Man Bun with Loose Strands") },
        { name: "Long Fringe with Layers", description: "Softens forehead.", image: img("Men", "Heart", "Long", "Men Heart Long Fringe with Layers") },
        { name: "Chin‑Length Flow (bold look)", description: "Balances narrow chin.", image: img("Men", "Heart", "Long", "Men Heart Chin‑Length Flow (bold look)") },
      ],
    },
    Diamond: {
      Short: [
        { name: "Classic Caesar Cut", description: "Fringe softens cheekbone width.", image: img("Men", "Diamond", "Short", "Men Diamond Classic Caesar Cut") },
        { name: "Crew Cut with Texture", description: "Adds balance; avoids sharper cheekbones.", image: img("Men", "Diamond", "Short", "Men Diamond Crew Cut with Texture") },
        { name: "Short Side‑Swept Fringe", description: "Reduces wide cheekbone effect.", image: img("Men", "Diamond", "Short", "Men Diamond Short Side Swept Fringe") },
        { name: "Low Fade + Brushed Forward Top", description: "Balances forehead & jaw.", image: img("Men", "Diamond", "Short", "Men Diamond Low Fade with Brushed Forward Top") },
        { name: "Buzz Cut (with beard)", description: "Beard adds jaw strength; avoids pointy look.", image: img("Men", "Diamond", "Short", "Men Diamond Buzz Cut (with Beard)") },
      ],
      Medium: [
        { name: "Medium Side Part with Layers", description: "Softens cheekbone width.", image: img("Men", "Diamond", "Medium", "Men Diamond Medium Side Part with Layers") },
        { name: "Textured Quiff (not too high)", description: "Adds dimension without excess height.", image: img("Men", "Diamond", "Medium", "Men Diamond Textured Quiff (not too high)") },
        { name: "Medium Undercut with Flow", description: "Stylish; draws attention away from chin.", image: img("Men", "Diamond", "Medium", "Men Diamond Medium Undercut with Flow") },
        { name: "Light Fringe / Forward Bangs", description: "Balances big forehead.", image: img("Men", "Diamond", "Medium", "Men Diamond Light Fringe / Forward Bangs") },
        { name: "Messy Medium Hair", description: "Casual volume softens face.", image: img("Men", "Diamond", "Medium", "Men Diamond Messy Medium Hair") },
      ],
      Long: [
        { name: "Wavy Shoulder‑Length Hair", description: "Adds fullness near jawline.", image: img("Men", "Diamond", "Long", "Men Diamond Wavy Shoulder‑Length Hair") },
        { name: "Layered Long Hair (messy look)", description: "Makes chin look stronger.", image: img("Men", "Diamond", "Long", "Men Diamond Layered Long Hair (messy look)") },
        { name: "Man Bun with Loose Strands", description: "Stylish; balances sharp forehead.", image: img("Men", "Diamond", "Long", "Men Diamond Man Bun with Loose Strands") },
        { name: "Long Fringe with Layers", description: "Softens forehead.", image: img("Men", "Diamond", "Long", "Men Diamond Long Fringe with Layers") },
        { name: "Chin‑Length Flow (bold look)", description: "Balances narrow chin.", image: img("Men", "Diamond", "Long", "Men Diamond Chin‑Length Flow (bold look)") },
      ],
    },
    Oblong: {
      Short: [
        { name: "Classic Crew Cut", description: "Adds width; avoids too much height.", image: img("Men", "Oblong", "Short", "Men Oblong Crew Cut") },
        { name: "Buzz Cut", description: "Clean; adds width.", image: img("Men", "Oblong", "Short", "Men Oblong Buzz Cut") },
        { name: "Textured Crop", description: "Adds texture and width.", image: img("Men", "Oblong", "Short", "Men Oblong Short Textured Crop with Fringe") },
        { name: "Side‑Swept Short Cut", description: "Breaks vertical lines.", image: img("Men", "Oblong", "Short", "Men Oblong Low Fade with Short Comb Over") },
        { name: "Caesar Cut", description: "Adds width; avoids elongation.", image: img("Men", "Oblong", "Short", "Men Oblong Ivy League Cut") },
      ],
      Medium: [
        { name: "Medium Side Part", description: "Breaks vertical lines.", image: img("Men", "Oblong", "Medium", "Men Oblong Classic Side Part") },
        { name: "Textured Quiff (not too high)", description: "Adds width without excess height.", image: img("Men", "Oblong", "Medium", "Men Oblong Textured Quiff (not too high)") },
        { name: "Medium Undercut with Flow", description: "Stylish; adds width.", image: img("Men", "Oblong", "Medium", "Men Oblong Medium Undercut with Flow") },
        { name: "Light Fringe / Forward Bangs", description: "Reduces forehead height.", image: img("Men", "Oblong", "Medium", "Men Oblong Light Fringe / Forward Bangs") },
        { name: "Messy Medium Hair", description: "Casual volume adds width.", image: img("Men", "Oblong", "Medium", "Men Oblong Messy Medium Hair") },
      ],
      Long: [
        { name: "Wavy Shoulder‑Length Hair", description: "Adds width; avoids too much length.", image: img("Men", "Oblong", "Long", "Men Oblong Wavy Shoulder‑Length Hair") },
        { name: "Layered Long Hair (messy look)", description: "Adds width; avoids elongation.", image: img("Men", "Oblong", "Long", "Men Oblong Layered Long Hair (messy look)") },
        { name: "Man Bun with Loose Strands", description: "Stylish; adds width.", image: img("Men", "Oblong", "Long", "Men Oblong Man Bun with Loose Strands") },
        { name: "Long Fringe with Layers", description: "Reduces forehead height.", image: img("Men", "Oblong", "Long", "Men Oblong Long Fringe with Layers") },
        { name: "Chin‑Length Flow (bold look)", description: "Adds width; avoids too much length.", image: img("Men", "Oblong", "Long", "Men Oblong Chin‑Length Flow (bold look)") },
      ],
    },
  },
};

// ---- UI helpers ----
const genders: Gender[] = ["Women", "Men"];
const faceShapes: FaceShape[] = ["Oval", "Round", "Square", "Heart", "Diamond", "Oblong"];
const lengths: HairLength[] = ["Short", "Medium", "Long"];

function classNames(...arr: (string | false | null | undefined)[]) {
  return arr.filter(Boolean).join(" ");
}

// Get user data from localStorage (from onboarding)
function getUserDataFromStorage(): { gender: Gender; faceShape: FaceShape } | null {
  try {
    const userData = JSON.parse(localStorage.getItem('auraasync_user_data') || '{}');
    
    if (!userData.gender || !userData.face_shape) {
      return null;
    }

    // Map your gender format to the component's format
    const genderMap: Record<string, Gender> = {
      'male': 'Men',
      'female': 'Women'
    };

    // Map your face shape format to the component's format
    const faceShapeMap: Record<string, FaceShape> = {
      'Oval': 'Oval',
      'Round': 'Round', 
      'Square': 'Square',
      'Heart': 'Heart',
      'Diamond': 'Diamond',
      'Rectangle': 'Oblong' // Map Rectangle to Oblong
    };

    const gender = genderMap[userData.gender];
    const faceShape = faceShapeMap[userData.face_shape];

    if (!gender || !faceShape) {
      return null;
    }

    return { gender, faceShape };
  } catch {
    return null;
  }
}

export default function HairstyleRecommender() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [gender, setGender] = useState<Gender | null>(null);
  const [faceShape, setFaceShape] = useState<FaceShape | null>(null);
  const [query, setQuery] = useState("");

  // Auto‑hydrate from user data (from onboarding)
  React.useEffect(() => {
    const userData = getUserDataFromStorage();
    if (userData) {
      setGender(userData.gender);
      setFaceShape(userData.faceShape);
      setStep(3);
    }
  }, []);

  const results = useMemo(() => {
    if (!gender || !faceShape) return null;
    const bucket = DATA[gender][faceShape];
    if (!bucket) return null;

    // Simple client‑side search across names/descriptions
    if (!query.trim()) return bucket;
    const q = query.toLowerCase();
    const filtered: LengthBuckets = {
      Short: bucket.Short.filter((s) => `${s.name} ${s.description}`.toLowerCase().includes(q)),
      Medium: bucket.Medium.filter((s) => `${s.name} ${s.description}`.toLowerCase().includes(q)),
      Long: bucket.Long.filter((s) => `${s.name} ${s.description}`.toLowerCase().includes(q)),
    };
    return filtered;
  }, [gender, faceShape, query]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-white">Auraasync • Hairstyle Recommendations</h1>
        <div className="text-sm opacity-70 text-white">Personalized for your face shape</div>
      </div>

      {/* Stepper (hidden when auto-detected) */}
      {!(gender && faceShape && step === 3) && (
        <ol className="mb-8 flex items-center gap-3 text-sm text-white">
          {[1, 2, 3].map((i) => (
            <li key={i} className="flex items-center gap-2">
              <span
                className={classNames(
                  "flex h-7 w-7 items-center justify-center rounded-full border",
                  step >= (i as 1 | 2 | 3) ? "bg-blue-600 text-white border-blue-600" : "bg-transparent border-white/30 text-white"
                )}
              >
                {i}
              </span>
              <span className="hidden sm:inline">
                {i === 1 ? "Select Gender" : i === 2 ? "Select Face Shape" : "Recommendations"}
              </span>
              {i !== 3 && <span className="mx-2 text-white/40">—</span>}
            </li>
          ))}
        </ol>
      )}

      {/* Step 1: Gender */}
      {step === 1 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {genders.map((g) => (
            <button
              key={g}
              onClick={() => {
                setGender(g);
                setStep(2);
              }}
              className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-6 text-left shadow-sm transition hover:shadow-md hover:bg-white/20"
            >
              <div className="text-lg font-medium text-white">{g}</div>
              <div className="mt-2 text-sm opacity-70 text-white">See styles curated for {g.toLowerCase()}.</div>
            </button>
          ))}
        </div>
      )}

      {/* Step 2: Face Shape */}
      {step === 2 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm opacity-75 text-white">Gender: <b>{gender}</b></div>
            {/* Change button removed as per requirement */}
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {faceShapes.map((shape) => (
              <button
                key={shape}
                onClick={() => {
                  setFaceShape(shape);
                  setStep(3);
                }}
                className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-5 text-left shadow-sm transition hover:shadow-md hover:bg-white/20"
              >
                <div className="text-base font-medium text-white">{shape}</div>
                <div className="mt-2 text-xs opacity-70 text-white">Tap to view recommended styles.</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Results */}
      {step === 3 && gender && faceShape && results && (
        <div className="space-y-6">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div className="text-sm opacity-75 text-white">
              Gender: <b>{gender}</b> • Face shape: <b>{faceShape}</b>
            </div>
            <div className="flex items-center gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search within styles (e.g., bangs, waves, layers)"
                className="w-full rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-white/50 sm:w-80"
              />
              {/* Remove change face shape button */}
            </div>
          </div>

          {lengths.map((len) => (
            <section key={len}>
              <h2 className="mb-3 text-lg font-semibold text-white">{len} Hair</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {results[len].length === 0 && (
                  <div className="col-span-full rounded-xl border  backdrop-blur-sm p-6 text-sm opacity-70 text-white">
                    No matches for &quot;{query}&quot; in {len.toLowerCase()} hair.
                  </div>
                )}
                {results[len].map((style) => (
                  <article key={style.name} className="group overflow-hidden rounded-2xl  shadow-sm transition hover:shadow-md hover:bg-white/20">
                    <div className="relative h-[300px] w-full">
                      {/* Replace with your images; next/image optimizes automatically */}
                      <Image
                        src={style.image}
                        alt={style.name}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                    <div className="p-4 text-center">
                      <div className="text-base font-medium text-white">{style.name}</div>
                      <p className="mt-1 text-sm opacity-80 text-white">{style.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}

          
        </div>
      )}

      {/* Empty state when step 3 has no data (shouldn’t happen) */}
      {step === 3 && (!gender || !faceShape) && (
        <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm p-6 text-sm opacity-75 text-white">Please complete the steps above.</div>
      )}
    </div>
  );
}
