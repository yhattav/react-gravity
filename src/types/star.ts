export interface StarTemplate {
  label: string;
  mass: number;
  size: number;
}

export interface GravityPoint {
  x: number;
  y: number;
  label: string;
  mass: number;
  color: string;
}

export enum StarClass {
  BROWN_DWARF = "BROWN_DWARF", // <0.08 solar masses
  RED_DWARF = "RED_DWARF", // 0.08-0.45 solar masses
  ORANGE_DWARF = "ORANGE_DWARF", // 0.45-0.8 solar masses
  YELLOW_DWARF = "YELLOW_DWARF", // 0.8-1.4 solar masses (like our Sun)
  WHITE_DWARF = "WHITE_DWARF", // 1.4-2.1 solar masses
  BLUE_GIANT = "BLUE_GIANT", // 2.1-20 solar masses
  BLUE_SUPERGIANT = "BLUE_SUPERGIANT", // >20 solar masses
  BLACK_HOLE = "BLACK_HOLE", // End state of massive stars
}
