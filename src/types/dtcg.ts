// ============================================
// W3C DTCG Token Format Types
// ============================================

// Hex color value (default) - e.g., "#3366ff" or "#3366ffcc" with alpha
export type DTCGHexColor = string;

// OKLCH color value (optional) - for Tailwind 4 compatibility
export interface DTCGOklchColor {
  colorSpace: 'oklch';
  components: [number, number, number]; // [lightness 0-1, chroma 0-0.4, hue 0-360]
  alpha?: number; // 0-1, optional if 1
}

// Color can be hex (default) or oklch (optional)
export type DTCGColorValue = DTCGHexColor | DTCGOklchColor;

// Dimension value
export interface DTCGDimensionValue {
  value: number;
  unit: 'px' | 'rem';
}

// Reference to another token
export type DTCGReference = `{${string}}`;

// All possible token values
export type DTCGTokenValue =
  | DTCGColorValue
  | DTCGDimensionValue
  | string          // fontFamily
  | number          // number, fontWeight
  | DTCGReference;

// Token structure
export interface DTCGToken {
  $value: DTCGTokenValue;
  $type?: 'color' | 'dimension' | 'number' | 'fontFamily' | 'fontWeight';
  $description?: string;
  $extensions?: Record<string, unknown>;
}

// Recursive token tree (groups + tokens)
export type DTCGTokenTree = {
  [key: string]: DTCGToken | DTCGTokenTree | string | undefined;
  $type?: string;
  $description?: string;
};

// Color format options
export type ColorFormat = 'hex' | 'oklch';

// Export configuration
export interface ExportConfig {
  collections: string[];           // Collection IDs to export
  modes: Record<string, string[]>; // Collection ID → selected Mode IDs
  includeDescriptions: boolean;
  defaultUnit: 'px' | 'rem';
  colorFormat: ColorFormat;        // 'hex' (default) or 'oklch'
  resolveReferences: boolean;      // true = flatten aliases to actual values
}

// Output file structure
export interface TokenFile {
  filename: string;      // e.g., "colors-light.json"
  collectionName: string;
  modeName: string;
  content: DTCGTokenTree;
}
