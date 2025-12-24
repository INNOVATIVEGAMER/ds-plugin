// ============================================
// Figma Variable & Style Extraction
// ============================================

// Types for extracted Figma data
export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number; // All values in 0-1 range
}

export type VariableValue =
  | { type: 'DIRECT'; value: RGBA | number | string | boolean }
  | { type: 'ALIAS'; variableId: string };

export interface ExtractedVariable {
  id: string;
  name: string;              // e.g., "colors/brand/primary"
  description: string;
  resolvedType: 'COLOR' | 'FLOAT' | 'STRING' | 'BOOLEAN';
  valuesByMode: Record<string, VariableValue>;
  scopes: string[];
  collectionId: string;
}

export interface ExtractedCollection {
  id: string;
  name: string;
  modes: Array<{ modeId: string; name: string }>;
  variables: ExtractedVariable[];
}

/**
 * Extract all variable collections from the current Figma file
 */
export async function extractAllCollections(): Promise<ExtractedCollection[]> {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const result: ExtractedCollection[] = [];

  for (const collection of collections) {
    const variables: ExtractedVariable[] = [];

    for (const varId of collection.variableIds) {
      const variable = await figma.variables.getVariableByIdAsync(varId);
      if (!variable) continue;

      const valuesByMode: Record<string, VariableValue> = {};

      for (const [modeId, value] of Object.entries(variable.valuesByMode)) {
        // Check if it's an alias (reference to another variable)
        if (isVariableAlias(value)) {
          valuesByMode[modeId] = { type: 'ALIAS', variableId: value.id };
        } else {
          valuesByMode[modeId] = { type: 'DIRECT', value: value as RGBA | number | string | boolean };
        }
      }

      variables.push({
        id: variable.id,
        name: variable.name,
        description: variable.description,
        resolvedType: variable.resolvedType,
        valuesByMode,
        scopes: variable.scopes,
        collectionId: collection.id,
      });
    }

    result.push({
      id: collection.id,
      name: collection.name,
      modes: collection.modes.map(m => ({ modeId: m.modeId, name: m.name })),
      variables,
    });
  }

  return result;
}

/**
 * Type guard to check if a value is a variable alias
 */
function isVariableAlias(value: unknown): value is { type: 'VARIABLE_ALIAS'; id: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    (value as { type: string }).type === 'VARIABLE_ALIAS'
  );
}

// ============================================
// Style Extraction Types
// ============================================

// Represents a value that can be either a variable reference or raw value
export type BoundValue<T> =
  | { type: 'reference'; variableName: string }  // e.g., "weight/semibold"
  | { type: 'value'; value: T };

export interface ExtractedTextStyle {
  id: string;
  name: string;
  description: string;
  // Each property can be a variable reference or raw value
  fontFamily: BoundValue<string>;
  fontSize: BoundValue<number>;
  fontWeight: BoundValue<number>;
  lineHeight: BoundValue<number | 'AUTO'>;
  letterSpacing: BoundValue<number>;
  // Raw values only (usually not bound to variables)
  paragraphSpacing: number;
  textCase: 'ORIGINAL' | 'UPPER' | 'LOWER' | 'TITLE' | 'SMALL_CAPS' | 'SMALL_CAPS_FORCED';
  textDecoration: 'NONE' | 'UNDERLINE' | 'STRIKETHROUGH';
}

export interface ExtractedShadowEffect {
  type: 'DROP_SHADOW' | 'INNER_SHADOW';
  visible: boolean;
  // Each property can be a variable reference or raw value
  color: BoundValue<RGBA>;
  offsetX: BoundValue<number>;
  offsetY: BoundValue<number>;
  blur: BoundValue<number>;
  spread: BoundValue<number>;
}

export interface ExtractedEffectStyle {
  id: string;
  name: string;
  description: string;
  effects: ExtractedShadowEffect[];  // Only shadow effects (DROP_SHADOW, INNER_SHADOW)
}

// ============================================
// Style Extraction Functions
// ============================================

/**
 * Helper to get variable name from a bound variable ID
 */
async function getVariableName(variableId: string): Promise<string | null> {
  try {
    const variable = await figma.variables.getVariableByIdAsync(variableId);
    return variable ? variable.name : null;
  } catch (_e) {
    return null;
  }
}

/**
 * Helper to create a BoundValue from a style property
 */
async function extractBoundValue<T>(
  boundVariables: Record<string, VariableAlias> | undefined,
  field: string,
  rawValue: T
): Promise<BoundValue<T>> {
  if (boundVariables && boundVariables[field]) {
    const variableName = await getVariableName(boundVariables[field].id);
    if (variableName) {
      return { type: 'reference', variableName };
    }
  }
  return { type: 'value', value: rawValue };
}

/**
 * Extract all text styles from the current Figma file
 */
export async function extractTextStyles(): Promise<ExtractedTextStyle[]> {
  const styles = await figma.getLocalTextStylesAsync();
  const result: ExtractedTextStyle[] = [];

  for (const style of styles) {
    const boundVars = style.boundVariables as Record<string, VariableAlias> | undefined;

    // Extract lineHeight raw value
    let lineHeightRaw: number | 'AUTO' = 'AUTO';
    if (style.lineHeight.unit === 'PIXELS') {
      lineHeightRaw = style.lineHeight.value;
    } else if (style.lineHeight.unit === 'PERCENT') {
      lineHeightRaw = style.lineHeight.value / 100; // Convert to ratio
    }

    // Extract letterSpacing raw value (in pixels)
    let letterSpacingRaw = 0;
    if (style.letterSpacing.unit === 'PIXELS') {
      letterSpacingRaw = style.letterSpacing.value;
    } else if (style.letterSpacing.unit === 'PERCENT') {
      // Convert percent to approximate pixels based on font size
      letterSpacingRaw = (style.letterSpacing.value / 100) * style.fontSize;
    }

    result.push({
      id: style.id,
      name: style.name,
      description: style.description,
      fontFamily: await extractBoundValue(boundVars, 'fontFamily', style.fontName.family),
      fontSize: await extractBoundValue(boundVars, 'fontSize', style.fontSize),
      fontWeight: await extractBoundValue(boundVars, 'fontWeight', 400), // Fallback, usually bound
      lineHeight: await extractBoundValue(boundVars, 'lineHeight', lineHeightRaw),
      letterSpacing: await extractBoundValue(boundVars, 'letterSpacing', letterSpacingRaw),
      paragraphSpacing: style.paragraphSpacing,
      textCase: style.textCase as ExtractedTextStyle['textCase'],
      textDecoration: style.textDecoration as ExtractedTextStyle['textDecoration'],
    });
  }

  return result;
}

/**
 * Extract all effect styles from the current Figma file
 * Only extracts shadow effects (DROP_SHADOW, INNER_SHADOW)
 */
export async function extractEffectStyles(): Promise<ExtractedEffectStyle[]> {
  const styles = await figma.getLocalEffectStylesAsync();
  const result: ExtractedEffectStyle[] = [];

  for (const style of styles) {
    const shadowEffects: ExtractedShadowEffect[] = [];

    for (const effect of style.effects) {
      // Only process shadow effects
      if (effect.type !== 'DROP_SHADOW' && effect.type !== 'INNER_SHADOW') {
        continue;
      }

      if (!effect.visible) continue;

      const shadowEffect = effect as DropShadowEffect | InnerShadowEffect;
      const boundVars = shadowEffect.boundVariables as Record<string, VariableAlias> | undefined;

      shadowEffects.push({
        type: shadowEffect.type,
        visible: shadowEffect.visible,
        color: await extractBoundValue(boundVars, 'color', shadowEffect.color as RGBA),
        offsetX: await extractBoundValue(boundVars, 'offsetX', shadowEffect.offset.x),
        offsetY: await extractBoundValue(boundVars, 'offsetY', shadowEffect.offset.y),
        blur: await extractBoundValue(boundVars, 'blur', shadowEffect.radius),
        spread: await extractBoundValue(boundVars, 'spread', shadowEffect.spread ?? 0),
      });
    }

    // Only add if there are shadow effects
    if (shadowEffects.length > 0) {
      result.push({
        id: style.id,
        name: style.name,
        description: style.description,
        effects: shadowEffects,
      });
    }
  }

  return result;
}
