// Constants for mass calculation
export const MIN_MASS = 1;
export const MAX_MASS = 2500000;
export const EXPONENT = 4;

export const percentageToMass = (percentage: number): number => {
  const exponentialValue = Math.pow(percentage, EXPONENT);
  return MIN_MASS + (MAX_MASS - MIN_MASS) * exponentialValue;
};

export const massToPercentage = (mass: number): number => {
  const normalizedMass = (mass - MIN_MASS) / (MAX_MASS - MIN_MASS);
  return Math.pow(normalizedMass, 1 / EXPONENT);
};

export const formatMass = (mass: number): string => {
  if (mass >= 1000000) {
    return `${(mass / 1000000).toFixed(1)}M`;
  } else if (mass >= 1000) {
    return `${(mass / 1000).toFixed(1)}K`;
  }
  return mass.toFixed(0);
};

export const getStarType = (mass: number): string => {
  if (mass < 1000) return "Brown Dwarf";
  if (mass < 20000) return "Red Dwarf";
  if (mass < 200000) return "Main Sequence";
  if (mass < 1000000) return "Red Giant";
  return "Super Giant";
};
