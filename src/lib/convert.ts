// ============================================
// DTCG Conversion
// ============================================

import type {
  DTCGTokenTree,
  DTCGToken,
  DTCGColorValue,
  DTCGDimensionValue,
  DTCGOklchColor,
  ExportConfig,
  DTCGReference,
  TokenFile,
  DTCGTypographyValue,
  DTCGShadowValue,
} from '../types/dtcg';
import type {
  ExtractedCollection,
  ExtractedVariable,
  VariableValue,
  RGBA,
  ExtractedTextStyle,
  ExtractedEffectStyle,
  BoundValue,
} from './extract';

/**
 * Build variable map for alias resolution (ID → Variable)
 */
export function buildVariableMap(
  collections: ExtractedCollection[]
): Map<string, ExtractedVariable> {
  const map = new Map<string, ExtractedVariable>();
  for (const collection of collections) {
    for (const variable of collection.variables) {
      map.set(variable.id, variable);
    }
  }
  return map;
}

/**
 * Main conversion function - converts extracted Figma data to DTCG format
 * Returns an array of TokenFile objects, one per collection-mode combination
 */
export function convertToDTCG(
  collections: ExtractedCollection[],
  config: ExportConfig,
  variableMap: Map<string, ExtractedVariable>
): TokenFile[] {
  const result: TokenFile[] = [];

  for (const collection of collections) {
    // Get selected modes for this collection
    const selectedModeIds =
      config.modes[collection.id] || collection.modes.map((m) => m.modeId);

    for (const mode of collection.modes) {
      if (!selectedModeIds.includes(mode.modeId)) continue;

      const tree = buildTokenTree(
        collection.variables,
        mode.modeId,
        config,
        variableMap
      );

      // Generate filename: lowercase with dashes, e.g., "colors-light.json"
      const filename = generateFilename(collection.name, mode.name);

      result.push({
        filename,
        collectionName: collection.name,
        modeName: mode.name,
        content: tree,
      });
    }
  }

  return result;
}

/**
 * Generate filename in lowercase with dashes
 * e.g., "My Colors" + "Light Mode" → "my-colors-light-mode.json"
 */
function generateFilename(collectionName: string, modeName: string): string {
  const sanitize = (str: string): string => {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with dashes
      .replace(/^-+|-+$/g, '');    // Trim leading/trailing dashes
  };

  return `${sanitize(collectionName)}-${sanitize(modeName)}.json`;
}

/**
 * Build nested token tree from flat variable list
 */
function buildTokenTree(
  variables: ExtractedVariable[],
  modeId: string,
  config: ExportConfig,
  variableMap: Map<string, ExtractedVariable>
): DTCGTokenTree {
  const tree: DTCGTokenTree = {};

  for (const variable of variables) {
    const modeValue = variable.valuesByMode[modeId];
    if (!modeValue) continue;

    // Split path: "colors/brand/primary" → ["colors", "brand", "primary"]
    const pathParts = variable.name.split('/');
    const tokenName = pathParts.pop()!;

    // Navigate/create nested groups
    let current: DTCGTokenTree = tree;
    for (const part of pathParts) {
      if (
        !current[part] ||
        typeof current[part] !== 'object' ||
        '$value' in (current[part] as object)
      ) {
        current[part] = {};
      }
      current = current[part] as DTCGTokenTree;
    }

    // Create the token
    current[tokenName] = createToken(variable, modeValue, modeId, config, variableMap);
  }

  return tree;
}

/**
 * Create a single DTCG token
 */
function createToken(
  variable: ExtractedVariable,
  modeValue: VariableValue,
  modeId: string,
  config: ExportConfig,
  variableMap: Map<string, ExtractedVariable>
): DTCGToken {
  const token: DTCGToken = {
    $value: convertValue(variable, modeValue, modeId, config, variableMap),
  };

  // Add type
  const type = inferType(variable);
  if (type) token.$type = type;

  // Add description if enabled
  if (config.includeDescriptions && variable.description) {
    token.$description = variable.description;
  }

  return token;
}

/**
 * Convert Figma value to DTCG value
 */
function convertValue(
  variable: ExtractedVariable,
  modeValue: VariableValue,
  modeId: string,
  config: ExportConfig,
  variableMap: Map<string, ExtractedVariable>
): DTCGToken['$value'] {
  // Handle alias/reference
  if (modeValue.type === 'ALIAS') {
    if (config.resolveReferences) {
      // Resolve to actual value
      return resolveAlias(modeValue.variableId, modeId, config, variableMap);
    }
    // Keep as reference
    return convertAlias(modeValue.variableId, variableMap);
  }

  const value = modeValue.value;

  switch (variable.resolvedType) {
    case 'COLOR':
      return convertColor(value as RGBA, config.colorFormat);

    case 'FLOAT':
      return convertFloat(value as number, variable, config.defaultUnit);

    case 'STRING':
      return value as string;

    case 'BOOLEAN':
      // DTCG doesn't have boolean type, store as number (0/1)
      return (value as boolean) ? 1 : 0;

    default:
      return value as number;
  }
}

/**
 * Resolve alias to actual value (recursive)
 */
function resolveAlias(
  variableId: string,
  modeId: string,
  config: ExportConfig,
  variableMap: Map<string, ExtractedVariable>,
  visited: Set<string> = new Set()
): DTCGToken['$value'] {
  // Prevent infinite loops from circular references
  if (visited.has(variableId)) {
    console.warn(`Circular reference detected: ${variableId}`);
    return '{circular}' as DTCGReference;
  }
  visited.add(variableId);

  const referenced = variableMap.get(variableId);
  if (!referenced) {
    console.warn(`Unknown variable reference: ${variableId}`);
    return '{unknown}' as DTCGReference;
  }

  // Get the value for the current mode, or fall back to first available mode
  let modeValue = referenced.valuesByMode[modeId];
  if (!modeValue) {
    const availableModes = Object.keys(referenced.valuesByMode);
    if (availableModes.length > 0) {
      modeValue = referenced.valuesByMode[availableModes[0]];
    }
  }

  if (!modeValue) {
    console.warn(`No value found for variable: ${referenced.name}`);
    return '{no-value}' as DTCGReference;
  }

  // Recursively resolve if this is also an alias
  if (modeValue.type === 'ALIAS') {
    return resolveAlias(modeValue.variableId, modeId, config, variableMap, visited);
  }

  // Convert the actual value
  const value = modeValue.value;

  switch (referenced.resolvedType) {
    case 'COLOR':
      return convertColor(value as RGBA, config.colorFormat);

    case 'FLOAT':
      return convertFloat(value as number, referenced, config.defaultUnit);

    case 'STRING':
      return value as string;

    case 'BOOLEAN':
      return (value as boolean) ? 1 : 0;

    default:
      return value as number;
  }
}

/**
 * Convert RGBA to hex string or OKLCH
 */
function convertColor(
  rgba: RGBA,
  format: 'hex' | 'oklch'
): DTCGColorValue {
  if (format === 'oklch') {
    return rgbaToOklch(rgba);
  }
  return rgbaToHex(rgba);
}

/**
 * Convert RGBA (0-1 range) to hex string
 */
function rgbaToHex(rgba: RGBA): string {
  const r = Math.round(rgba.r * 255);
  const g = Math.round(rgba.g * 255);
  const b = Math.round(rgba.b * 255);

  const hex = `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;

  // Add alpha if not fully opaque
  if (rgba.a < 1) {
    const a = Math.round(rgba.a * 255);
    return `${hex}${componentToHex(a)}`;
  }

  return hex;
}

/**
 * Convert a single color component (0-255) to 2-digit hex
 */
function componentToHex(c: number): string {
  const hex = c.toString(16);
  return hex.length === 1 ? '0' + hex : hex;
}

/**
 * Convert RGBA to OKLCH color format
 * Uses sRGB → Linear RGB → XYZ → OKLAB → OKLCH conversion
 */
function rgbaToOklch(rgba: RGBA): DTCGOklchColor {
  // Step 1: sRGB to Linear RGB
  const linearR = srgbToLinear(rgba.r);
  const linearG = srgbToLinear(rgba.g);
  const linearB = srgbToLinear(rgba.b);

  // Step 2: Linear RGB to XYZ (D65)
  const x = 0.4124564 * linearR + 0.3575761 * linearG + 0.1804375 * linearB;
  const y = 0.2126729 * linearR + 0.7151522 * linearG + 0.0721750 * linearB;
  const z = 0.0193339 * linearR + 0.1191920 * linearG + 0.9503041 * linearB;

  // Step 3: XYZ to OKLAB
  const l_ = 0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z;
  const m_ = 0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z;
  const s_ = 0.0482003018 * x + 0.2643662691 * y + 0.6338517070 * z;

  const l_3 = Math.cbrt(l_);
  const m_3 = Math.cbrt(m_);
  const s_3 = Math.cbrt(s_);

  const L = 0.2104542553 * l_3 + 0.7936177850 * m_3 - 0.0040720468 * s_3;
  const a = 1.9779984951 * l_3 - 2.4285922050 * m_3 + 0.4505937099 * s_3;
  const b = 0.0259040371 * l_3 + 0.7827717662 * m_3 - 0.8086757660 * s_3;

  // Step 4: OKLAB to OKLCH
  const C = Math.sqrt(a * a + b * b);
  let H = Math.atan2(b, a) * (180 / Math.PI);
  if (H < 0) H += 360;

  // Round to reasonable precision
  const result: DTCGOklchColor = {
    colorSpace: 'oklch',
    components: [
      Math.round(L * 1000) / 1000,      // Lightness: 0-1
      Math.round(C * 1000) / 1000,      // Chroma: 0-0.4 typically
      Math.round(H * 10) / 10,          // Hue: 0-360
    ],
  };

  // Add alpha if not fully opaque
  if (rgba.a < 1) {
    result.alpha = Math.round(rgba.a * 1000) / 1000;
  }

  return result;
}

/**
 * Convert sRGB component to linear RGB
 */
function srgbToLinear(c: number): number {
  if (c <= 0.04045) {
    return c / 12.92;
  }
  return Math.pow((c + 0.055) / 1.055, 2.4);
}

/**
 * Convert float to dimension or number
 */
function convertFloat(
  value: number,
  variable: ExtractedVariable,
  defaultUnit: 'px' | 'rem'
): DTCGDimensionValue | number {
  // Check if it should be a plain number (opacity, etc.)
  const isPlainNumber =
    variable.scopes.includes('OPACITY') ||
    variable.scopes.includes('FONT_WEIGHT') ||
    /opacity|alpha|weight/i.test(variable.name);

  if (isPlainNumber) {
    return value;
  }

  // Otherwise it's a dimension
  return { value, unit: defaultUnit };
}

/**
 * Convert alias to DTCG reference
 */
function convertAlias(
  variableId: string,
  variableMap: Map<string, ExtractedVariable>
): DTCGReference {
  const referenced = variableMap.get(variableId);
  if (!referenced) {
    console.warn(`Unknown variable reference: ${variableId}`);
    return `{unknown}` as DTCGReference;
  }

  // Convert "colors/brand/primary" to "{colors.brand.primary}"
  const path = referenced.name.replace(/\//g, '.');
  return `{${path}}` as DTCGReference;
}

/**
 * Infer DTCG type from Figma variable
 */
function inferType(variable: ExtractedVariable): DTCGToken['$type'] {
  switch (variable.resolvedType) {
    case 'COLOR':
      return 'color';

    case 'FLOAT':
      if (
        variable.scopes.includes('FONT_WEIGHT') ||
        /weight/i.test(variable.name)
      ) {
        return 'fontWeight';
      }
      if (
        variable.scopes.includes('OPACITY') ||
        /opacity/i.test(variable.name)
      ) {
        return 'number';
      }
      return 'dimension';

    case 'STRING':
      if (
        variable.scopes.includes('FONT_FAMILY') ||
        /font-?family/i.test(variable.name)
      ) {
        return 'fontFamily';
      }
      return undefined; // No standard DTCG type for generic strings

    case 'BOOLEAN':
      return undefined; // No DTCG type for boolean

    default:
      return undefined;
  }
}

// ============================================
// Style to DTCG Conversion
// ============================================

/**
 * Convert variable name to DTCG reference
 * "weight/semibold" → "{weight.semibold}"
 */
function variableNameToReference(variableName: string): DTCGReference {
  const path = variableName.replace(/\//g, '.');
  return `{${path}}` as DTCGReference;
}

/**
 * Convert BoundValue to DTCG value (reference or raw value)
 */
function convertBoundValue<T>(
  boundValue: BoundValue<T>,
  rawValueConverter: (value: T) => DTCGReference | DTCGDimensionValue | DTCGColorValue | string | number
): DTCGReference | DTCGDimensionValue | DTCGColorValue | string | number {
  if (boundValue.type === 'reference') {
    return variableNameToReference(boundValue.variableName);
  }
  return rawValueConverter(boundValue.value);
}

/**
 * Convert extracted text styles to DTCG token tree
 */
export function convertTextStylesToDTCG(
  textStyles: ExtractedTextStyle[],
  config: ExportConfig
): DTCGTokenTree {
  const tree: DTCGTokenTree = {};

  for (const style of textStyles) {
    // Split path: "Heading/Large" → ["Heading", "Large"]
    const pathParts = style.name.split('/');
    const tokenName = pathParts.pop()!;

    // Navigate/create nested groups
    let current: DTCGTokenTree = tree;
    for (const part of pathParts) {
      if (!current[part] || typeof current[part] !== 'object' || '$value' in (current[part] as object)) {
        current[part] = {};
      }
      current = current[part] as DTCGTokenTree;
    }

    // Build typography value with references or raw values
    const typographyValue: Record<string, unknown> = {
      fontFamily: convertBoundValue(style.fontFamily, (v) => v),
      fontSize: convertBoundValue(style.fontSize, (v) => ({ value: v, unit: config.defaultUnit })),
      fontWeight: convertBoundValue(style.fontWeight, (v) => v),
      lineHeight: convertBoundValue(style.lineHeight, (v) =>
        v === 'AUTO' ? 'auto' : (typeof v === 'number' ? v : v)
      ),
    };

    // Add letterSpacing if present
    const letterSpacingValue = convertBoundValue(style.letterSpacing, (v) =>
      v !== 0 ? { value: v, unit: config.defaultUnit } : { value: 0, unit: config.defaultUnit }
    );
    if (letterSpacingValue !== undefined) {
      typographyValue.letterSpacing = letterSpacingValue;
    }

    // Create the token
    const token: DTCGToken = {
      $type: 'typography',
      $value: typographyValue as unknown as DTCGTypographyValue,
    };

    // Add description if enabled
    if (config.includeDescriptions && style.description) {
      token.$description = style.description;
    }

    current[tokenName] = token;
  }

  return tree;
}

/**
 * Convert extracted effect styles to DTCG token tree
 */
export function convertEffectStylesToDTCG(
  effectStyles: ExtractedEffectStyle[],
  config: ExportConfig
): DTCGTokenTree {
  const tree: DTCGTokenTree = {};

  for (const style of effectStyles) {
    // Split path: "Shadow/Large" → ["Shadow", "Large"]
    const pathParts = style.name.split('/');
    const tokenName = pathParts.pop()!;

    // Navigate/create nested groups
    let current: DTCGTokenTree = tree;
    for (const part of pathParts) {
      if (!current[part] || typeof current[part] !== 'object' || '$value' in (current[part] as object)) {
        current[part] = {};
      }
      current = current[part] as DTCGTokenTree;
    }

    // Convert each shadow effect
    const shadowValues: DTCGShadowValue[] = style.effects.map((effect) => {
      const shadow: Record<string, unknown> = {
        offsetX: convertBoundValue(effect.offsetX, (v) => ({ value: v, unit: config.defaultUnit })),
        offsetY: convertBoundValue(effect.offsetY, (v) => ({ value: v, unit: config.defaultUnit })),
        blur: convertBoundValue(effect.blur, (v) => ({ value: v, unit: config.defaultUnit })),
        spread: convertBoundValue(effect.spread, (v) => ({ value: v, unit: config.defaultUnit })),
        color: convertBoundValue(effect.color, (v) => convertColor(v, config.colorFormat)),
      };

      // Add inset for inner shadows
      if (effect.type === 'INNER_SHADOW') {
        shadow.inset = true;
      }

      return shadow as unknown as DTCGShadowValue;
    });

    // Create the token - single shadow or array
    const token: DTCGToken = {
      $type: 'shadow',
      $value: shadowValues.length === 1 ? shadowValues[0] : shadowValues,
    };

    // Add description if enabled
    if (config.includeDescriptions && style.description) {
      token.$description = style.description;
    }

    current[tokenName] = token;
  }

  return tree;
}
