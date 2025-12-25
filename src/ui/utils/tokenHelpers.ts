import type { FlattenedToken, TokenType } from '../types/ui';

// ============================================
// Dimension Value Parsing
// ============================================

type DimensionValue = { value: number; unit: string } | number | string;

interface ParsedDimension {
  pixels: number;
  displayValue: string;
}

/**
 * Parse a dimension value into numeric pixels and display string.
 * Handles DTCG object format, string with unit, or raw number.
 */
export function parseDimensionValue(value: unknown): ParsedDimension {
  const dimValue = value as DimensionValue;

  if (typeof dimValue === 'object' && dimValue !== null && 'value' in dimValue) {
    return {
      pixels: dimValue.value,
      displayValue: `${dimValue.value}${dimValue.unit}`,
    };
  }

  if (typeof dimValue === 'string') {
    const match = dimValue.match(/^([\d.]+)/);
    const pixels = match ? parseFloat(match[1]) : 0;
    return { pixels, displayValue: dimValue };
  }

  const pixels = Number(dimValue) || 0;
  return { pixels, displayValue: `${pixels}px` };
}

// ============================================
// Token Display Helpers
// ============================================

/**
 * Format a token's display name with optional group prefix.
 */
export function formatTokenName(token: FlattenedToken): string {
  return token.group ? `${token.group}/${token.name}` : token.name;
}

// ============================================
// DTCG Token Types
// ============================================

/**
 * DTCG Token structure
 */
interface DTCGToken {
  $value: unknown;
  $type?: string;
  $description?: string;
}

type DTCGTokenTree = {
  [key: string]: DTCGToken | DTCGTokenTree | string | undefined;
};

/**
 * Check if a value is a DTCG token (has $value)
 */
function isToken(value: unknown): value is DTCGToken {
  return typeof value === 'object' && value !== null && '$value' in value;
}

/**
 * Check if a value is a token group (object without $value)
 */
function isGroup(value: unknown): value is DTCGTokenTree {
  return typeof value === 'object' && value !== null && !('$value' in value);
}

/**
 * Path/name patterns for type inference
 */
const TYPE_PATTERNS: Array<{ pattern: RegExp; type: TokenType }> = [
  // Radius patterns - check before size (includes round, corners, etc.)
  { pattern: /radius|corner|corners|rounded|round\b/i, type: 'radius' },
  // Border width patterns
  { pattern: /border[-_]?width|stroke[-_]?width|border[-_]?size/i, type: 'borderWidth' },
  // Spacing patterns - check before size
  { pattern: /spacing|space|gap|margin|padding|inset/i, type: 'spacing' },
  // Size patterns - exclude width/height that might be part of borderWidth
  { pattern: /\bsize\b|(?<!border[-_]?)width|height|icon[-_]?size/i, type: 'size' },
];

/**
 * Infer the display type from token's $type, path, collection name, and value structure
 */
function inferTokenType(token: DTCGToken, path: string, collectionName: string = ''): TokenType {
  // Combine collection name with path for pattern matching
  const fullContext = collectionName ? `${collectionName}.${path}` : path;
  const contextLower = fullContext.toLowerCase();

  // Use explicit $type if available
  if (token.$type) {
    const type = token.$type.toLowerCase();
    if (type === 'color') return 'color';
    if (type === 'typography') return 'typography';
    if (type === 'shadow') return 'shadow';
    if (type === 'fontfamily') return 'fontFamily';
    if (type === 'fontweight') return 'fontWeight';
    if (type === 'number') {
      // Even with $type: number, check path for specific types
      for (const { pattern, type: inferredType } of TYPE_PATTERNS) {
        if (pattern.test(contextLower)) return inferredType;
      }
      return 'number';
    }
    if (type === 'dimension') {
      // Dimension can be size, spacing, radius, or borderWidth
      for (const { pattern, type: inferredType } of TYPE_PATTERNS) {
        if (pattern.test(contextLower)) return inferredType;
      }
      return 'size'; // Default dimension to size
    }
  }

  // Infer from value structure
  const value = token.$value;

  // Color detection
  if (typeof value === 'string' && value.startsWith('#')) {
    return 'color';
  }
  if (typeof value === 'object' && value !== null) {
    if ('colorSpace' in value) return 'color';
    if ('fontFamily' in value) return 'typography';
    if ('offsetX' in value || 'blur' in value) return 'shadow';
    if ('unit' in value) {
      // Dimension with unit - check path for specific type
      for (const { pattern, type: inferredType } of TYPE_PATTERNS) {
        if (pattern.test(contextLower)) return inferredType;
      }
      return 'size';
    }
  }

  // For numbers/strings, check path patterns
  if (typeof value === 'number' || typeof value === 'string') {
    for (const { pattern, type: inferredType } of TYPE_PATTERNS) {
      if (pattern.test(contextLower)) return inferredType;
    }
  }

  return 'number';
}

/**
 * Extract group path from full token path
 */
function getGroupFromPath(path: string): string {
  const parts = path.split('.');
  if (parts.length <= 1) return '';
  return parts.slice(0, -1).join('.');
}

/**
 * Flatten a DTCG token tree into an array of tokens with paths
 */
export function flattenTokenTree(
  tree: Record<string, unknown>,
  parentPath: string = '',
  collectionName: string = ''
): FlattenedToken[] {
  const tokens: FlattenedToken[] = [];

  for (const [key, value] of Object.entries(tree)) {
    // Skip metadata keys
    if (key.startsWith('$')) continue;

    const currentPath = parentPath ? `${parentPath}.${key}` : key;

    if (isToken(value)) {
      tokens.push({
        path: currentPath,
        name: key,
        group: getGroupFromPath(currentPath),
        type: inferTokenType(value, currentPath, collectionName),
        value: value.$value,
        rawValue: value.$value,
        description: value.$description,
      });
    } else if (isGroup(value)) {
      // Recurse into group
      tokens.push(...flattenTokenTree(value as Record<string, unknown>, currentPath, collectionName));
    }
  }

  return tokens;
}

/**
 * Group tokens by their type
 */
export function groupTokensByType(tokens: FlattenedToken[]): Record<TokenType, FlattenedToken[]> {
  const groups: Record<TokenType, FlattenedToken[]> = {
    color: [],
    size: [],
    spacing: [],
    radius: [],
    borderWidth: [],
    number: [],
    fontFamily: [],
    fontWeight: [],
    typography: [],
    shadow: [],
  };

  for (const token of tokens) {
    groups[token.type].push(token);
  }

  return groups;
}

/**
 * Token group node for hierarchical display
 */
export interface TokenGroupNode {
  name: string;
  path: string;
  tokens: FlattenedToken[];
  children: Record<string, TokenGroupNode>;
}

/**
 * Build hierarchical token tree for sidebar display
 */
export function buildTokenHierarchy(tokens: FlattenedToken[]): TokenGroupNode {
  const root: TokenGroupNode = {
    name: '',
    path: '',
    tokens: [],
    children: {},
  };

  for (const token of tokens) {
    const parts = token.group.split('.').filter(Boolean);
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const currentPath = parts.slice(0, i + 1).join('.');

      if (!current.children[part]) {
        current.children[part] = {
          name: part,
          path: currentPath,
          tokens: [],
          children: {},
        };
      }
      current = current.children[part];
    }

    current.tokens.push(token);
  }

  return root;
}

/**
 * Count total tokens in a hierarchy node (including children)
 */
export function countTokensInNode(node: TokenGroupNode): number {
  let count = node.tokens.length;
  for (const child of Object.values(node.children)) {
    count += countTokensInNode(child);
  }
  return count;
}

/**
 * Get all tokens from a hierarchy node (including children)
 */
export function getAllTokensFromNode(node: TokenGroupNode): FlattenedToken[] {
  const tokens = [...node.tokens];
  for (const child of Object.values(node.children)) {
    tokens.push(...getAllTokensFromNode(child));
  }
  return tokens;
}

/**
 * Get the top-level groups from a token tree
 */
export function getTopLevelGroups(tree: Record<string, unknown>): string[] {
  return Object.keys(tree).filter((key) => !key.startsWith('$'));
}

/**
 * Count tokens in a tree
 */
export function countTokens(tree: Record<string, unknown>): number {
  let count = 0;

  for (const [key, value] of Object.entries(tree)) {
    if (key.startsWith('$')) continue;

    if (isToken(value)) {
      count++;
    } else if (isGroup(value)) {
      count += countTokens(value as Record<string, unknown>);
    }
  }

  return count;
}
