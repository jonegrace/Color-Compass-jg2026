import chroma from 'chroma-js';
import { GeneratedPalette } from '../types';

export const isValidHex = (hex: string): boolean => {
  return chroma.valid(hex);
};

export const generatePalette = (base: string, steps: number): GeneratedPalette => {
  if (!chroma.valid(base)) {
    // Return empty arrays if invalid, though UI should prevent this
    return {
      tints: [], shades: [], saturate: [], desaturate: [], random: [],
      darkMode: [], lightMode: [], complementary: [], splitComplementary: [],
      triadic: [], analogous: [], tetradic: []
    };
  }

  const baseColor = chroma(base);

  // Helper to generate a scale
  // mode('lch') often gives smoother gradients
  const genScale = (start: string | chroma.Color, end: string | chroma.Color, count: number) => 
    chroma.scale([start, end]).mode('lch').colors(count);

  // Tints: Base -> White
  // We exclude the base itself to avoid duplication in the visual stack if needed, 
  // but standard practice is usually inclusive. Let's make it inclusive but purely lighter.
  // Actually, Tints usually implies adding white.
  const tints = chroma.scale([base, '#ffffff']).mode('lch').colors(steps + 1).slice(0, steps); 
  
  // Shades: Base -> Black
  const shades = chroma.scale([base, '#000000']).mode('lch').colors(steps + 1).slice(0, steps);

  // Saturate: Increase saturation
  const saturate = Array.from({ length: steps }, (_, i) => {
    return baseColor.set('hsl.s', Math.min(1, baseColor.get('hsl.s') + ((i + 1) * 0.1))).hex();
  });

  // Desaturate: Decrease saturation
  const desaturate = Array.from({ length: steps }, (_, i) => {
    return baseColor.set('hsl.s', Math.max(0, baseColor.get('hsl.s') - ((i + 1) * 0.1))).hex();
  });

  // Harmonies
  const complementary = [baseColor.set('hsl.h', baseColor.get('hsl.h') + 180).hex()];
  
  const splitComplementary = [
    baseColor.set('hsl.h', baseColor.get('hsl.h') + 150).hex(),
    baseColor.set('hsl.h', baseColor.get('hsl.h') + 210).hex(),
  ];

  const triadic = [
    baseColor.set('hsl.h', baseColor.get('hsl.h') + 120).hex(),
    baseColor.set('hsl.h', baseColor.get('hsl.h') + 240).hex(),
  ];

  const analogous = [
    baseColor.set('hsl.h', baseColor.get('hsl.h') - 30).hex(),
    baseColor.set('hsl.h', baseColor.get('hsl.h') + 30).hex(),
    baseColor.set('hsl.h', baseColor.get('hsl.h') + 60).hex(),
  ];

  const tetradic = [
    baseColor.set('hsl.h', baseColor.get('hsl.h') + 90).hex(),
    baseColor.set('hsl.h', baseColor.get('hsl.h') + 180).hex(),
    baseColor.set('hsl.h', baseColor.get('hsl.h') + 270).hex(),
  ];

  // Mode-aware palettes
  // Dark Mode: often desaturated and slightly lighter to pop against dark grey
  const darkMode = chroma.scale([base, '#1f2937']).mode('lch').colors(6).reverse().map(c => 
    chroma(c).desaturate(0.5).brighten(0.5).hex()
  );

  // Light Mode: often standard or slightly darkened for contrast against white
  const lightMode = chroma.scale([base, '#f3f4f6']).mode('lch').colors(6);

  // Random: slight hue/sat variations
  const random = Array.from({ length: 6 }, () => {
    const h = baseColor.get('hsl.h') + (Math.random() * 60 - 30);
    const s = Math.min(1, Math.max(0, baseColor.get('hsl.s') + (Math.random() * 0.4 - 0.2)));
    const l = Math.min(1, Math.max(0, baseColor.get('hsl.l') + (Math.random() * 0.4 - 0.2)));
    return chroma.hsl(h, s, l).hex();
  });

  return {
    tints,
    shades,
    saturate,
    desaturate,
    random,
    darkMode,
    lightMode,
    complementary,
    splitComplementary,
    triadic,
    analogous,
    tetradic
  };
};

export const blendColors = (c1: string, c2: string, steps: number): string[] => {
  if (!chroma.valid(c1) || !chroma.valid(c2)) return [];
  return chroma.scale([c1, c2]).mode('lch').colors(steps);
};

export const generateSvgStrip = (colors: string[]): string => {
  if (!colors || colors.length === 0) return '';
  const size = 50;
  const width = colors.length * size;
  const height = size;
  
  const rects = colors.map((c, i) => 
    `<rect x="${i * size}" y="0" width="${size}" height="${height}" fill="${c}" />`
  ).join('');

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">${rects}</svg>`;
};