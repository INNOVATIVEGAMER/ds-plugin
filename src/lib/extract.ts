// ============================================
// Figma Variable Extraction
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
