import React from "react";
import { StarTemplate } from "../../types/star";

// Color interpolation function
const interpolateColor = (mass: number): string => {
  // Temperature scale (roughly maps stellar mass to temperature)
  const temp = Math.min(Math.pow(mass, 0.5) * 3000 + 2000, 40000);
  console.log(temp, mass);
  // Simplified blackbody radiation approximation
  if (mass >= 50) return "#000000"; // Black hole

  if (temp < 3500) {
    // Brown to red (2000K - 3500K)
    return `rgb(${Math.min(temp / 10, 255)}, ${temp / 20}, 0)`;
  } else if (temp < 5000) {
    // Red to orange to yellow (3500K - 5000K)
    return `rgb(255, ${Math.min((temp - 3500) / 6, 255)}, 0)`;
  } else if (temp < 6000) {
    // Yellow to white (5000K - 6000K)
    const blueVal = Math.min((temp - 5000) / 4, 255);
    return `rgb(255, 255, ${blueVal})`;
  } else {
    // White to blue (6000K+)
    const redGreen = Math.max(255 - (temp - 6000) / 50, 100);
    return `rgb(${redGreen}, ${redGreen}, 255)`;
  }
};

// Glow intensity function
const calculateGlow = (mass: number): number => {
  if (mass >= 50) return 30; // Black hole
  return Math.pow(mass, 0.4) * 10 + 5; // Smooth increase with mass
};

const getAccretionDiskStyle = (mass: number) => {
  if (mass < 50) return {};

  return {
    border: "1px solid #FF00FF",
    boxShadow: `
      0 0 4px #FF00FF,
      0 0 8px rgba(255, 0, 255, 0.5),
      0 0 12px rgba(0, 0, 255, 0.3),
      inset 0 0 4px #FF00FF,
      inset 0 0 8px rgba(255, 0, 255, 0.5)
    `,
    animation: "rotate 3s linear infinite",
  };
};

// Size calculation function based on mass
const calculateSize = (mass: number): number => {
  // Constants for our size calculation
  const MIN_SIZE = 5;
  const MAX_SIZE = 15;
  const PEAK_MASS = 20; // Mass at which stars reach their maximum size
  const BLACK_HOLE_MASS = 50;

  // For black holes, return smaller size
  if (mass >= BLACK_HOLE_MASS) {
    return 15; // Black holes appear compact
  }

  // Calculate relative position on the curve
  const x = mass / PEAK_MASS;

  // Bell-curve-like function that peaks at PEAK_MASS
  // and gradually decreases after that
  const sizeRange = MAX_SIZE - MIN_SIZE;
  const bellCurve = Math.exp(-Math.pow(x - 1, 2)) * sizeRange;

  return Math.round(MIN_SIZE + bellCurve);
};

// Convert simulator mass units to solar masses
const convertToSolarMasses = (simulatorMass: number): number => {
  const MASS_CONVERSION_FACTOR = 50000; // 50000 simulator units = 1 solar mass
  return simulatorMass / MASS_CONVERSION_FACTOR;
};

interface StarRendererProps {
  mass: number; // in solar masses
}

export const StarRenderer: React.FC<StarRendererProps> = ({ mass }) => {
  // Convert the mass before using it in visual calculations
  const solarMass = convertToSolarMasses(mass);

  const color = interpolateColor(solarMass);
  const glow = calculateGlow(solarMass);
  const accretionStyle = getAccretionDiskStyle(solarMass);
  const size = calculateSize(solarMass);

  return (
    <>
      <style>
        {`
          @keyframes rotate {
            from { transform: translate(-50%, -50%) rotate(0deg); }
            to { transform: translate(-50%, -50%) rotate(360deg); }
          }
        `}
      </style>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: "50%",
          boxShadow:
            solarMass >= 50
              ? `0 0 ${glow}px 5px rgba(0, 0, 0, 0.8)`
              : `0 0 ${glow}px ${color}`,
          transition: "all 0.3s ease",
          ...accretionStyle,
        }}
      />
    </>
  );
};
