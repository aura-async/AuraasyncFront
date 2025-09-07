// Units: centimeters by default. Convert before passing if you collect inches.
export const UNITS = {
  LENGTH: "cm",
};

// Helper to check if a value is within a min/max range
function isWithinRange(value, min, max) {
  return value >= min && value <= max;
}

// -----------------------------
// FEMALE BODY TYPES (Updated based on new user data)
// -----------------------------
export const femaleBodyTypes = [
  {
    id: "hourglass",
    label: "Hourglass",
    description: "Balanced proportions with a defined waist.",
    measurementsRange: {
      bust: { min: 90, max: 100 },
      waist: { min: 60, max: 70 },
      hips: { min: 90, max: 100 }, // Inferred based on bust/shoulders
      shoulders: { min: 90, max: 100 },
      bicep: { min: 28, max: 32 },
    },
    example: {
      bust: 95,
      waist: 65,
      hips: 95,
      shoulders: 95,
      bicep: 30,
    },
  },
  {
    id: "pear",
    label: "Pear (Triangle)",
    description: "Narrow shoulders, wider hips and thighs.",
    measurementsRange: {
      bust: { min: 85, max: 95 },
      waist: { min: 65, max: 75 },
      hips: { min: 95, max: 105 }, // Wider hips than bust
      shoulders: { min: 85, max: 95 },
      bicep: { min: 27, max: 31 },
    },
    example: {
      bust: 90,
      waist: 70,
      hips: 100,
      shoulders: 90,
      bicep: 29,
    },
  },
  {
    id: "rectangle",
    label: "Rectangle (Straight)",
    description: "Straight silhouette with minimal waist definition.",
    measurementsRange: {
      bust: { min: 88, max: 98 },
      waist: { min: 70, max: 80 },
      hips: { min: 88, max: 98 }, // Similar to bust
      shoulders: { min: 88, max: 98 },
      bicep: { min: 28, max: 32 },
    },
    example: {
      bust: 93,
      waist: 75,
      hips: 93,
      shoulders: 93,
      bicep: 30,
    },
  },
  {
    id: "apple",
    label: "Apple (Oval)",
    description: "Broader shoulders and chest, narrower hips.",
    measurementsRange: {
      bust: { min: 95, max: 105 },
      waist: { min: 75, max: 85 },
      hips: { min: 85, max: 95 }, // Narrower than bust
      shoulders: { min: 95, max: 105 },
      bicep: { min: 29, max: 33 },
    },
    example: {
      bust: 100,
      waist: 80,
      hips: 90,
      shoulders: 100,
      bicep: 31,
    },
  },
];

// -----------------------------
// MALE BODY TYPES (Replaced based on new user data)
// -----------------------------
export const maleBodyTypes = [
  {
    id: "mesomorph",
    label: "Mesomorph (Athletic/Muscular Build)",
    description: "Broad shoulders, defined muscles, and a relatively narrow waist.",
    measurementsRange: {
      chest: { min: 105, max: 115 },
      waist: { min: 80, max: 90 },
      shoulders: { min: 115, max: 125 },
      bicep: { min: 35, max: 40 },
    },
    example: {
      chest: 110,
      waist: 85,
      shoulders: 120,
      bicep: 37.5,
    },
  },
  {
    id: "ectomorph",
    label: "Ectomorph (Slim/Lean Build)",
    description: "Narrow shoulders, slim build, and long limbs.",
    measurementsRange: {
      chest: { min: 85, max: 95 },
      waist: { min: 70, max: 80 },
      shoulders: { min: 95, max: 105 },
      bicep: { min: 28, max: 32 },
    },
    example: {
      chest: 90,
      waist: 75,
      shoulders: 100,
      bicep: 30,
    },
  },
  {
    id: "endomorph",
    label: "Endomorph (Round/Soft Build)",
    description: "Wider waist, broader build, and softer muscle definition.",
    measurementsRange: {
      chest: { min: 100, max: 110 },
      waist: { min: 90, max: 100 },
      shoulders: { min: 110, max: 120 },
      bicep: { min: 33, max: 38 },
    },
    example: {
      chest: 105,
      waist: 95,
      shoulders: 115,
      bicep: 35.5,
    },
  },
];

// Updated guess functions to use the new measurementsRange
export function guessFemaleType(m) {
  const scored = femaleBodyTypes.map((t) => {
    let score = 0;
    const { measurementsRange } = t;
    
    // Check each measurement against the range
    if (m.bust != null && measurementsRange.bust) {
      if (isWithinRange(m.bust, measurementsRange.bust.min, measurementsRange.bust.max)) score += 1;
    }
    if (m.waist != null && measurementsRange.waist) {
      if (isWithinRange(m.waist, measurementsRange.waist.min, measurementsRange.waist.max)) score += 1;
    }
    if (m.hips != null && measurementsRange.hips) {
      if (isWithinRange(m.hips, measurementsRange.hips.min, measurementsRange.hips.max)) score += 1;
    }
    if (m.shoulders != null && measurementsRange.shoulders) {
      if (isWithinRange(m.shoulders, measurementsRange.shoulders.min, measurementsRange.shoulders.max)) score += 1;
    }
    if (m.bicep != null && measurementsRange.bicep) {
      if (isWithinRange(m.bicep, measurementsRange.bicep.min, measurementsRange.bicep.max)) score += 1;
    }
    
    return { id: t.id, label: t.label, score: Number(score.toFixed(3)) };
  });
  
  return scored.sort((a, b) => b.score - a.score);
}

export function guessMaleType(m) {
  const scored = maleBodyTypes.map((t) => {
    let score = 0;
    const { measurementsRange } = t;
    
    // Check each measurement against the range
    if (m.chest != null && measurementsRange.chest) {
      if (isWithinRange(m.chest, measurementsRange.chest.min, measurementsRange.chest.max)) score += 1;
    }
    if (m.waist != null && measurementsRange.waist) {
      if (isWithinRange(m.waist, measurementsRange.waist.min, measurementsRange.waist.max)) score += 1;
    }
    if (m.shoulders != null && measurementsRange.shoulders) {
      if (isWithinRange(m.shoulders, measurementsRange.shoulders.min, measurementsRange.shoulders.max)) score += 1;
    }
    if (m.bicep != null && measurementsRange.bicep) {
      if (isWithinRange(m.bicep, measurementsRange.bicep.min, measurementsRange.bicep.max)) score += 1;
    }
    
    return { id: t.id, label: t.label, score: Number(score.toFixed(3)) };
  });
  
  return scored.sort((a, b) => b.score - a.score);
}

// Utility functions for unit conversion
export function inchesToCm(inches) {
  return inches * 2.54;
}

export function cmToInches(cm) {
  return cm / 2.54;
}

// Helper function to convert string to number
export function num(value) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
}
