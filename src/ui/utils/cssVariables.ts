import type { FlattenedToken } from '../types/ui';

/**
 * OKLCH color structure
 */
interface OklchColor {
  colorSpace: 'oklch';
  components: [number, number, number];
  alpha?: number;
}

/**
 * Dimension value structure
 */
interface DimensionValue {
  value: number;
  unit: string;
}

/**
 * Shadow value structure
 */
interface ShadowValue {
  color: string | OklchColor;
  offsetX: DimensionValue;
  offsetY: DimensionValue;
  blur: DimensionValue;
  spread: DimensionValue;
  inset?: boolean;
}

/**
 * Check if value is an OKLCH color
 */
function isOklchColor(value: unknown): value is OklchColor {
  return (
    typeof value === 'object' &&
    value !== null &&
    'colorSpace' in value &&
    (value as OklchColor).colorSpace === 'oklch'
  );
}

/**
 * Check if value is a dimension
 */
function isDimension(value: unknown): value is DimensionValue {
  return typeof value === 'object' && value !== null && 'value' in value && 'unit' in value;
}

/**
 * Convert a token path to a CSS variable name
 * "colors.brand.primary" -> "--colors-brand-primary"
 */
export function toVariableName(path: string, prefix: string = ''): string {
  const sanitized = path
    .replace(/\./g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '-')
    .toLowerCase();
  return prefix ? `--${prefix}-${sanitized}` : `--${sanitized}`;
}

/**
 * Convert a color value to CSS string
 */
export function convertColorToCSS(value: unknown): string {
  if (typeof value === 'string') {
    return value; // Already hex
  }

  if (isOklchColor(value)) {
    const { components, alpha } = value;
    const [l, c, h] = components;
    return alpha !== undefined && alpha < 1
      ? `oklch(${l} ${c} ${h} / ${alpha})`
      : `oklch(${l} ${c} ${h})`;
  }

  return '#000000';
}

/**
 * Convert a dimension value to CSS string
 */
export function convertDimensionToCSS(value: unknown): string {
  if (isDimension(value)) {
    return `${value.value}${value.unit}`;
  }
  if (typeof value === 'number') {
    return `${value}px`;
  }
  return String(value);
}

/**
 * Convert a shadow value to CSS box-shadow string
 */
export function convertShadowToCSS(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map((s) => singleShadowToCSS(s)).join(', ');
  }
  return singleShadowToCSS(value);
}

function singleShadowToCSS(shadow: unknown): string {
  if (!shadow || typeof shadow !== 'object') return 'none';

  const s = shadow as ShadowValue;
  const inset = s.inset ? 'inset ' : '';
  const offsetX = convertDimensionToCSS(s.offsetX);
  const offsetY = convertDimensionToCSS(s.offsetY);
  const blur = convertDimensionToCSS(s.blur);
  const spread = convertDimensionToCSS(s.spread);
  const color = convertColorToCSS(s.color);

  return `${inset}${offsetX} ${offsetY} ${blur} ${spread} ${color}`;
}

/**
 * Convert a token value to CSS based on its type
 */
export function convertValueToCSS(value: unknown, type: string): string | null {
  switch (type) {
    case 'color':
      return convertColorToCSS(value);

    case 'dimension':
      return convertDimensionToCSS(value);

    case 'shadow':
      return convertShadowToCSS(value);

    case 'number':
    case 'fontWeight':
      return String(value);

    case 'fontFamily':
      return typeof value === 'string' ? `"${value}"` : String(value);

    case 'typography':
      // Typography is composite, handled separately
      return null;

    default:
      return String(value);
  }
}

/**
 * Generate CSS custom properties from flattened tokens
 */
export function generateCSSVariables(
  tokens: FlattenedToken[],
  prefix: string = ''
): Record<string, string> {
  const variables: Record<string, string> = {};

  for (const token of tokens) {
    // Skip typography and shadow composites for now (they need special handling)
    if (token.type === 'typography' || token.type === 'shadow') {
      continue;
    }

    const varName = toVariableName(token.path, prefix);
    const cssValue = convertValueToCSS(token.value, token.type);

    if (cssValue !== null) {
      variables[varName] = cssValue;
    }
  }

  return variables;
}

/**
 * Get display value for a token (human-readable format)
 */
export function getDisplayValue(token: FlattenedToken): string {
  const { value, type } = token;

  switch (type) {
    case 'color':
      return convertColorToCSS(value);

    case 'dimension':
      return convertDimensionToCSS(value);

    case 'shadow':
      return convertShadowToCSS(value);

    case 'typography': {
      const t = value as Record<string, unknown>;
      const family = t.fontFamily || 'System';
      const size = isDimension(t.fontSize) ? convertDimensionToCSS(t.fontSize) : t.fontSize;
      const weight = t.fontWeight || 400;
      return `${family} / ${weight} / ${size}`;
    }

    case 'number':
    case 'fontWeight':
      return String(value);

    case 'fontFamily':
      return String(value);

    default:
      return String(value);
  }
}
