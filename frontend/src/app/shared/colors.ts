// Configuración de colores para TypeScript
export const COLORS = {
  azul: '#006dc0',
  azure: '#057dde', 
  silver: '#bbbfc2',
  white: '#fdfefd',
  lapis: '#005faa',
  silverLake: '#5f87ad',
  indigo: '#01457d'
} as const;

export const BOOTSTRAP_COLORS = {
  primary: '#006dc0',    // Azul
  secondary: '#5f87ad',  // Silver Lake Blue
  success: '#057dde',    // Azure
  info: '#005faa',       // Lapis Lazuli
  warning: '#bbbfc2',    // Silver
  danger: '#01457d',     // Indigo
  light: '#fdfefd',      // White
  dark: '#01457d'        // Indigo
} as const;

export type ColorName = keyof typeof COLORS;
export type BootstrapColor = keyof typeof BOOTSTRAP_COLORS;