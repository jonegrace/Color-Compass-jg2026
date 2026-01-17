export interface ColorData {
  hex: string;
  name?: string; // Optional, could use a namer library in future
}

export interface GeneratedPalette {
  tints: string[];
  shades: string[];
  saturate: string[];
  desaturate: string[];
  random: string[];
  darkMode: string[];
  lightMode: string[];
  complementary: string[];
  splitComplementary: string[];
  triadic: string[];
  analogous: string[];
  tetradic: string[];
}

export interface AppState {
  baseColor: string;
  activeColor: string;
  steps: number;
  library: string[];
  prevBaseColor: string | null;
}
