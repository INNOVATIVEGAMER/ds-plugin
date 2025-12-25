// UI-specific types

export type TabId = 'preview' | 'export';

export interface Tab {
  id: TabId;
  label: string;
}

// Flattened token for preview display
export interface FlattenedToken {
  path: string;           // "colors.brand.primary"
  name: string;           // "primary"
  group: string;          // "colors.brand" - parent path for grouping
  type: TokenType;        // Display type
  value: unknown;         // Resolved value for preview
  rawValue: unknown;      // Original $value (may be reference)
  description?: string;
}

export type TokenType =
  | 'color'
  | 'size'
  | 'spacing'
  | 'radius'
  | 'borderWidth'
  | 'number'
  | 'fontFamily'
  | 'fontWeight'
  | 'typography'
  | 'shadow';

// Collection info from Figma
export interface CollectionInfo {
  id: string;
  name: string;
  modes: Array<{ modeId: string; name: string }>;
  variableCount: number;
}

// Text style info (for export tab)
export interface TextStyleInfo {
  id: string;
  name: string;
  fontFamily: string;
  fontWeight: string;
  fontSize: string;
}

// Effect style info (for export tab)
export interface EffectStyleInfo {
  id: string;
  name: string;
  effectCount: number;
  effectTypes: string[];
}

// Detailed text style for preview (resolved values)
export interface TextStylePreview {
  id: string;
  name: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number | 'AUTO';
  letterSpacing: number;
}

// Shadow effect for preview
export interface ShadowEffectPreview {
  type: 'DROP_SHADOW' | 'INNER_SHADOW';
  color: string;  // rgba string
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;
}

// Detailed effect style for preview
export interface EffectStylePreview {
  id: string;
  name: string;
  effects: ShadowEffectPreview[];
}

// Mode info for styles
export interface StylesModeInfo {
  modeId: string;
  name: string;
  collectionName: string;
}

// Styles preview data from sandbox
export interface StylesPreviewData {
  textStyles: TextStylePreview[];
  effectStyles: EffectStylePreview[];
  availableModes: StylesModeInfo[];
  selectedModeId: string | null;
}

// Token file for export results
export interface TokenFile {
  filename: string;
  path: string;
  collectionName: string;
  modeName: string;
  content: Record<string, unknown>;
}

// Export options
export interface ExportOptions {
  includeDescriptions: boolean;
  colorFormat: 'hex' | 'oklch';
  resolveReferences: boolean;
}

// Preview data from sandbox
export interface PreviewData {
  collectionId: string;
  collectionName: string;
  modeId: string;
  modeName: string;
  tokenTree: Record<string, unknown>;
}
