// ============================================
// Font Source Configuration
// ============================================
// Maps font names to their source information for downstream CSS generation

export interface GoogleFontSource {
  type: 'google';
  family: string;       // URL-encoded family name for Google Fonts API
  weights: number[];    // Available weights to load
  styles: ('normal' | 'italic')[];
}

export interface SystemFontSource {
  type: 'system';
}

export interface CustomFontSource {
  type: 'custom';
  url?: string;         // Custom font URL (for future use)
}

export type FontSource = GoogleFontSource | SystemFontSource | CustomFontSource;

/**
 * Font source mapping configuration
 * Add fonts used in your design system here
 */
export const FONT_SOURCE_MAP: Record<string, FontSource> = {
  // Google Fonts
  'Inter': {
    type: 'google',
    family: 'Inter',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    styles: ['normal'],
  },
  'JetBrains Mono': {
    type: 'google',
    family: 'JetBrains+Mono',
    weights: [400, 500, 600, 700],
    styles: ['normal'],
  },
  'Roboto': {
    type: 'google',
    family: 'Roboto',
    weights: [100, 300, 400, 500, 700, 900],
    styles: ['normal', 'italic'],
  },
  'Roboto Mono': {
    type: 'google',
    family: 'Roboto+Mono',
    weights: [400, 500, 600, 700],
    styles: ['normal'],
  },
  'Open Sans': {
    type: 'google',
    family: 'Open+Sans',
    weights: [300, 400, 500, 600, 700, 800],
    styles: ['normal', 'italic'],
  },
  'Lato': {
    type: 'google',
    family: 'Lato',
    weights: [100, 300, 400, 700, 900],
    styles: ['normal', 'italic'],
  },
  'Montserrat': {
    type: 'google',
    family: 'Montserrat',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    styles: ['normal', 'italic'],
  },
  'Poppins': {
    type: 'google',
    family: 'Poppins',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    styles: ['normal', 'italic'],
  },
  'Source Sans Pro': {
    type: 'google',
    family: 'Source+Sans+Pro',
    weights: [200, 300, 400, 600, 700, 900],
    styles: ['normal', 'italic'],
  },
  'Source Code Pro': {
    type: 'google',
    family: 'Source+Code+Pro',
    weights: [200, 300, 400, 500, 600, 700, 900],
    styles: ['normal'],
  },
  'Fira Code': {
    type: 'google',
    family: 'Fira+Code',
    weights: [300, 400, 500, 600, 700],
    styles: ['normal'],
  },
  'Nunito': {
    type: 'google',
    family: 'Nunito',
    weights: [200, 300, 400, 500, 600, 700, 800, 900],
    styles: ['normal', 'italic'],
  },
  'Raleway': {
    type: 'google',
    family: 'Raleway',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    styles: ['normal', 'italic'],
  },
  'Work Sans': {
    type: 'google',
    family: 'Work+Sans',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    styles: ['normal', 'italic'],
  },
  'DM Sans': {
    type: 'google',
    family: 'DM+Sans',
    weights: [400, 500, 700],
    styles: ['normal', 'italic'],
  },
  'IBM Plex Sans': {
    type: 'google',
    family: 'IBM+Plex+Sans',
    weights: [100, 200, 300, 400, 500, 600, 700],
    styles: ['normal', 'italic'],
  },
  'IBM Plex Mono': {
    type: 'google',
    family: 'IBM+Plex+Mono',
    weights: [100, 200, 300, 400, 500, 600, 700],
    styles: ['normal', 'italic'],
  },
  'Playfair Display': {
    type: 'google',
    family: 'Playfair+Display',
    weights: [400, 500, 600, 700, 800, 900],
    styles: ['normal', 'italic'],
  },
  'Merriweather': {
    type: 'google',
    family: 'Merriweather',
    weights: [300, 400, 700, 900],
    styles: ['normal', 'italic'],
  },

  // System fonts (no import needed)
  'Arial': { type: 'system' },
  'Helvetica': { type: 'system' },
  'Helvetica Neue': { type: 'system' },
  'Georgia': { type: 'system' },
  'Times New Roman': { type: 'system' },
  'Times': { type: 'system' },
  'Courier New': { type: 'system' },
  'Courier': { type: 'system' },
  'Verdana': { type: 'system' },
  'Tahoma': { type: 'system' },
  'Trebuchet MS': { type: 'system' },
  'Impact': { type: 'system' },
  'Comic Sans MS': { type: 'system' },
  'Lucida Console': { type: 'system' },
  'Lucida Sans Unicode': { type: 'system' },
  'Palatino Linotype': { type: 'system' },
  'Book Antiqua': { type: 'system' },
  'Garamond': { type: 'system' },

  // macOS system fonts
  'SF Pro': { type: 'system' },
  'SF Pro Display': { type: 'system' },
  'SF Pro Text': { type: 'system' },
  'SF Mono': { type: 'system' },
  'New York': { type: 'system' },

  // Windows system fonts
  'Segoe UI': { type: 'system' },
  'Segoe UI Variable': { type: 'system' },
  'Consolas': { type: 'system' },

  // Generic CSS font families
  'system-ui': { type: 'system' },
  'ui-sans-serif': { type: 'system' },
  'ui-serif': { type: 'system' },
  'ui-monospace': { type: 'system' },
  'sans-serif': { type: 'system' },
  'serif': { type: 'system' },
  'monospace': { type: 'system' },
  'cursive': { type: 'system' },
  'fantasy': { type: 'system' },
};

/**
 * Get font source information for a given font name
 * Returns system type for unknown fonts (safe default)
 */
export function getFontSource(fontName: string): FontSource {
  const source = FONT_SOURCE_MAP[fontName];

  if (source) {
    return source;
  }

  // Unknown font - default to system (safe fallback)
  console.warn(`Unknown font "${fontName}" - treating as system font`);
  return { type: 'system' };
}

/**
 * Check if a font is from Google Fonts
 */
export function isGoogleFont(fontName: string): boolean {
  const source = FONT_SOURCE_MAP[fontName];
  return source?.type === 'google';
}
