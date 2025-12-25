// ============================================
// Styles Preview - Variable resolution for text/effect styles
// ============================================

// Types
interface TextStylePreview {
  id: string;
  name: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number | 'AUTO';
  letterSpacing: number;
}

interface ShadowEffectPreview {
  type: 'DROP_SHADOW' | 'INNER_SHADOW';
  color: string;
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;
}

interface EffectStylePreview {
  id: string;
  name: string;
  effects: ShadowEffectPreview[];
}

interface StylesModeInfo {
  modeId: string;
  name: string;
  collectionName: string;
}

export interface StylesPreviewResult {
  textStyles: TextStylePreview[];
  effectStyles: EffectStylePreview[];
  availableModes: StylesModeInfo[];
  selectedModeId: string | null;
}

// ============================================
// Helpers
// ============================================

/** Convert font style name to numeric weight */
function getFontWeight(styleName: string): number {
  const lower = styleName.toLowerCase();
  if (lower.includes('thin') || lower.includes('hairline')) return 100;
  if (lower.includes('extralight') || lower.includes('ultra light')) return 200;
  if (lower.includes('light')) return 300;
  if (lower.includes('regular') || lower.includes('normal') || lower === 'book') return 400;
  if (lower.includes('medium')) return 500;
  if (lower.includes('semibold') || lower.includes('semi bold') || lower.includes('demi')) return 600;
  if (lower.includes('extrabold') || lower.includes('ultra bold')) return 800;
  if (lower.includes('bold')) return 700;
  if (lower.includes('black') || lower.includes('heavy')) return 900;
  return 400;
}

/** Convert RGBA to CSS string */
function rgbaToCSS(color: RGBA): string {
  return `rgba(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(color.b * 255)}, ${color.a})`;
}

/** Create a variable cache with collection tracking */
function createVariableResolver() {
  const cache = new Map<string, Variable>();
  const textCollections = new Set<string>();
  const effectCollections = new Set<string>();

  return {
    /** Get variable by ID, caching the result */
    async get(variableId: string): Promise<Variable | null> {
      const cached = cache.get(variableId);
      if (cached) return cached;

      const variable = await figma.variables.getVariableByIdAsync(variableId);
      if (variable) cache.set(variableId, variable);
      return variable;
    },

    /** Track which collection a variable belongs to for a style type */
    async track(variableId: string, styleType: 'text' | 'effect'): Promise<void> {
      const variable = await this.get(variableId);
      if (!variable) return;

      if (styleType === 'text') {
        textCollections.add(variable.variableCollectionId);
      } else {
        effectCollections.add(variable.variableCollectionId);
      }
    },

    /** Get variable value for a specific mode */
    async getValue(variableId: string, modeId: string | null): Promise<unknown> {
      const variable = await this.get(variableId);
      if (!variable) return null;

      if (modeId && variable.valuesByMode[modeId] !== undefined) {
        return variable.valuesByMode[modeId];
      }

      const firstModeId = Object.keys(variable.valuesByMode)[0];
      return firstModeId ? variable.valuesByMode[firstModeId] : null;
    },

    /** Get tracked collections for a view type */
    getCollections(viewType: 'text' | 'effect' | null): Set<string> {
      if (viewType === 'text') return textCollections;
      if (viewType === 'effect') return effectCollections;
      return new Set([...textCollections, ...effectCollections]);
    },
  };
}

/** Scan bound variables in styles to track referenced collections */
async function scanBoundVariables(
  textStyles: TextStyle[],
  effectStyles: EffectStyle[],
  resolver: ReturnType<typeof createVariableResolver>
): Promise<void> {
  // Scan text styles
  for (const style of textStyles) {
    const boundVars = style.boundVariables as Record<string, VariableAlias> | undefined;
    if (!boundVars) continue;

    const fields = ['fontSize', 'fontWeight', 'lineHeight', 'letterSpacing'] as const;
    for (const field of fields) {
      if (boundVars[field]) await resolver.track(boundVars[field].id, 'text');
    }
  }

  // Scan effect styles
  for (const style of effectStyles) {
    for (const effect of style.effects) {
      if (effect.type !== 'DROP_SHADOW' && effect.type !== 'INNER_SHADOW') continue;

      const shadowEffect = effect as DropShadowEffect | InnerShadowEffect;
      const boundVars = shadowEffect.boundVariables as Record<string, VariableAlias> | undefined;
      if (!boundVars) continue;

      const fields = ['color', 'offsetX', 'offsetY', 'radius', 'spread'] as const;
      for (const field of fields) {
        if (boundVars[field]) await resolver.track(boundVars[field].id, 'effect');
      }
    }
  }
}

/** Build available modes from referenced collections */
function buildAvailableModes(
  collectionIds: Set<string>,
  collectionMap: Map<string, VariableCollection>
): StylesModeInfo[] {
  const modes: StylesModeInfo[] = [];

  for (const collectionId of collectionIds) {
    const collection = collectionMap.get(collectionId);
    if (!collection) continue;

    for (const mode of collection.modes) {
      modes.push({
        modeId: mode.modeId,
        name: mode.name,
        collectionName: collection.name,
      });
    }
  }

  return modes;
}

/** Extract text style preview with variable resolution */
async function extractTextStylePreview(
  style: TextStyle,
  selectedModeId: string | null,
  resolver: ReturnType<typeof createVariableResolver>
): Promise<TextStylePreview> {
  const boundVars = style.boundVariables as Record<string, VariableAlias> | undefined;

  // Resolve fontSize
  let fontSize = style.fontSize;
  if (boundVars?.fontSize && selectedModeId) {
    const value = await resolver.getValue(boundVars.fontSize.id, selectedModeId);
    if (typeof value === 'number') fontSize = value;
  }

  // Resolve fontWeight
  let fontWeight = getFontWeight(style.fontName.style);
  if (boundVars?.fontWeight && selectedModeId) {
    const value = await resolver.getValue(boundVars.fontWeight.id, selectedModeId);
    if (typeof value === 'number') fontWeight = value;
  }

  // Resolve lineHeight
  let lineHeight: number | 'AUTO' = 'AUTO';
  if (style.lineHeight.unit === 'PIXELS') {
    lineHeight = style.lineHeight.value;
  } else if (style.lineHeight.unit === 'PERCENT') {
    lineHeight = style.lineHeight.value / 100;
  }
  if (boundVars?.lineHeight && selectedModeId) {
    const value = await resolver.getValue(boundVars.lineHeight.id, selectedModeId);
    if (typeof value === 'number') lineHeight = value;
  }

  // Resolve letterSpacing
  let letterSpacing = 0;
  if (style.letterSpacing.unit === 'PIXELS') {
    letterSpacing = style.letterSpacing.value;
  } else if (style.letterSpacing.unit === 'PERCENT') {
    letterSpacing = (style.letterSpacing.value / 100) * fontSize;
  }
  if (boundVars?.letterSpacing && selectedModeId) {
    const value = await resolver.getValue(boundVars.letterSpacing.id, selectedModeId);
    if (typeof value === 'number') letterSpacing = value;
  }

  return {
    id: style.id,
    name: style.name,
    fontFamily: style.fontName.family,
    fontSize,
    fontWeight,
    lineHeight,
    letterSpacing,
  };
}

/** Extract effect style preview with variable resolution */
async function extractEffectStylePreview(
  style: EffectStyle,
  selectedModeId: string | null,
  resolver: ReturnType<typeof createVariableResolver>
): Promise<EffectStylePreview | null> {
  const shadowEffects: ShadowEffectPreview[] = [];

  for (const effect of style.effects) {
    if (effect.type !== 'DROP_SHADOW' && effect.type !== 'INNER_SHADOW') continue;
    if (!effect.visible) continue;

    const shadowEffect = effect as DropShadowEffect | InnerShadowEffect;
    const boundVars = shadowEffect.boundVariables as Record<string, VariableAlias> | undefined;

    // Resolve color
    let color = shadowEffect.color;
    if (boundVars?.color && selectedModeId) {
      const value = await resolver.getValue(boundVars.color.id, selectedModeId);
      if (value && typeof value === 'object' && 'r' in value) {
        color = value as RGBA;
      }
    }

    // Resolve offsets
    let offsetX = shadowEffect.offset.x;
    let offsetY = shadowEffect.offset.y;
    if (boundVars?.offsetX && selectedModeId) {
      const value = await resolver.getValue(boundVars.offsetX.id, selectedModeId);
      if (typeof value === 'number') offsetX = value;
    }
    if (boundVars?.offsetY && selectedModeId) {
      const value = await resolver.getValue(boundVars.offsetY.id, selectedModeId);
      if (typeof value === 'number') offsetY = value;
    }

    // Resolve blur and spread
    let blur = shadowEffect.radius;
    let spread = shadowEffect.spread ?? 0;
    if (boundVars?.radius && selectedModeId) {
      const value = await resolver.getValue(boundVars.radius.id, selectedModeId);
      if (typeof value === 'number') blur = value;
    }
    if (boundVars?.spread && selectedModeId) {
      const value = await resolver.getValue(boundVars.spread.id, selectedModeId);
      if (typeof value === 'number') spread = value;
    }

    shadowEffects.push({
      type: shadowEffect.type,
      color: rgbaToCSS(color),
      offsetX,
      offsetY,
      blur,
      spread,
    });
  }

  if (shadowEffects.length === 0) return null;

  return {
    id: style.id,
    name: style.name,
    effects: shadowEffects,
  };
}

// ============================================
// Main Export
// ============================================

/**
 * Get styles preview data with mode-aware variable resolution.
 */
export async function getStylesPreview(
  selectedModeId: string | null,
  viewType: 'text' | 'effect' | null
): Promise<StylesPreviewResult> {
  // Get collections and build lookup map
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const collectionMap = new Map(collections.map(c => [c.id, c]));

  // Create variable resolver
  const resolver = createVariableResolver();

  // Get styles
  const textStyles = await figma.getLocalTextStylesAsync();
  const effectStyles = await figma.getLocalEffectStylesAsync();

  // Scan to find referenced variables
  await scanBoundVariables(textStyles, effectStyles, resolver);

  // Build available modes for the current view type
  const relevantCollections = resolver.getCollections(viewType);
  const availableModes = buildAvailableModes(relevantCollections, collectionMap);

  // Extract text style previews
  const textStylePreviews = await Promise.all(
    textStyles.map(style => extractTextStylePreview(style, selectedModeId, resolver))
  );

  // Extract effect style previews
  const effectStylePreviews = (
    await Promise.all(
      effectStyles.map(style => extractEffectStylePreview(style, selectedModeId, resolver))
    )
  ).filter((s): s is EffectStylePreview => s !== null);

  return {
    textStyles: textStylePreviews,
    effectStyles: effectStylePreviews,
    availableModes,
    selectedModeId,
  };
}
