# DTCG Token Exporter - Figma Plugin

## Workflow Instructions

When working on tasks:

1. **Plan first**: Create a clear todo list with steps before starting
2. **Summarize after each step**: Provide a concise summary of what was done after completing each todo/phase
3. **Wait for confirmation**: Pause after each summary for user review before moving to the next step
4. **Keep summaries brief**: Use tables or bullet points, not lengthy explanations
5. **Keep docs in sync**: After significant changes to a package, proactively check if updates are needed to:
   - Root `CLAUDE.md`

## Project Overview

A Figma plugin that exports Figma Variables and Styles to W3C Design Tokens Community Group (DTCG) standardized JSON format. It bridges Figma's native Variables and Styles systems with the emerging industry standard for design tokens, enabling design system teams to maintain a single source of truth.

**Plugin ID:** `nexus-dtcg-exporter`

## Architecture

This plugin uses Figma's dual-context architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                     Figma Sandbox                           │
│  src/code.ts - Runs in Figma's secure context with         │
│  access to figma.* APIs                                     │
│                         ↕ postMessage                       │
│  src/ui/App.tsx - React UI in iframe                        │
└─────────────────────────────────────────────────────────────┘
```

### Message Flow

- **UI → Sandbox:** `GET_COLLECTIONS`, `GET_STYLES`, `EXPORT`, `CLOSE`
- **Sandbox → UI:** `COLLECTIONS_DATA`, `STYLES_DATA`, `EXPORT_RESULT`, `EXPORT_ERROR`

## Key Files

| File                 | Purpose                                                      |
| -------------------- | ------------------------------------------------------------ |
| `src/code.ts`        | Figma sandbox code - message handler, API orchestration      |
| `src/lib/extract.ts` | Variable & style extraction from Figma API                   |
| `src/lib/convert.ts` | DTCG conversion logic, color math, typography & shadow conversion |
| `src/types/dtcg.ts`  | TypeScript types for DTCG format                             |
| `src/ui/App.tsx`     | Main React UI component                                      |
| `src/ui/styles.css`  | UI styling                                                   |
| `manifest.json`      | Figma plugin metadata                                        |

## Build Commands

```bash
# Development (watch mode for both plugin and UI)
npm run dev

# Production build
npm run build

# Build plugin code only
npm run build:plugin

# Build UI only
npm run build:ui
```

## Tech Stack

- **Build:** Vite 5, TypeScript 5.3
- **UI:** React 18
- **Plugin:** Figma Plugin Typings
- **Utilities:** JSZip (for bulk downloads)
- **Critical:** vite-plugin-singlefile (bundles UI into single HTML - required by Figma)

## Code Organization

```
src/
├── code.ts              # Plugin entry point (sandbox context)
├── lib/
│   ├── extract.ts       # extractAllCollections(), extractTextStyles(), extractEffectStyles()
│   └── convert.ts       # convertToDTCG(), convertTextStylesToDTCG(), convertEffectStylesToDTCG()
├── types/
│   └── dtcg.ts          # DTCG type definitions (tokens, typography, shadow)
└── ui/
    ├── App.tsx          # React UI with collection/style selection
    ├── main.tsx         # React entry
    ├── index.html       # HTML template
    └── styles.css       # Styling
```

## Key Conversion Pipeline

### Variables
1. `extractAllCollections()` - Fetches all Figma variable collections
2. `buildVariableMap()` - Creates ID→Variable lookup for alias resolution
3. `convertToDTCG()` - Converts to DTCG format with nested token structure
4. Output: `{collection-name}-{mode-name}.json` files

### Text Styles
1. `extractTextStyles()` - Fetches all Figma text styles with bound variable detection
2. `convertTextStylesToDTCG()` - Converts to DTCG typography composite tokens
3. Output: `typography.json`

### Effect Styles (Shadows)
1. `extractEffectStyles()` - Fetches all Figma effect styles (DROP_SHADOW, INNER_SHADOW)
2. `convertEffectStylesToDTCG()` - Converts to DTCG shadow composite tokens
3. Output: `shadows.json`

## Important Technical Details

### Variable Types Handled

- `COLOR` → `color` type (hex or OKLCH format)
- `FLOAT` → `dimension` or `number` (inferred from scope/naming)
- `STRING` → `fontFamily` or string
- `BOOLEAN` → boolean

### Style Types Handled

- **Text Styles** → `typography` composite token
  - fontFamily, fontSize, fontWeight, lineHeight, letterSpacing
  - Supports variable references via `boundVariables`
- **Effect Styles** → `shadow` composite token
  - offsetX, offsetY, blur, spread, color, inset
  - Supports variable references via `boundVariables`

### BoundValue Pattern

Styles use a `BoundValue<T>` union type to track whether a property references a variable or contains a raw value:

```typescript
type BoundValue<T> =
  | { type: 'reference'; variableName: string }  // e.g., "weight/semibold"
  | { type: 'value'; value: T };
```

### Smart Type Inference

Uses Figma scopes (`OPACITY`, `FONT_WEIGHT`, etc.) and regex patterns to distinguish:

- Dimensions (with px/rem units)
- Font weights
- Opacity values
- Plain numbers

### Color Conversion

Supports advanced OKLCH conversion for Tailwind v4 compatibility:

- sRGB → Linear RGB → XYZ → OKLAB → OKLCH

### Alias Resolution

- Handles cross-collection references
- Circular reference detection with warnings
- Mode fallback for missing values

## Export Configuration

```typescript
interface ExportConfig {
  collections: string[];           // Collection IDs to export
  modes: Record<string, string[]>; // Collection ID → Mode IDs
  includeDescriptions: boolean;    // Add $description fields
  defaultUnit: "px" | "rem";       // Dimension units
  colorFormat: "hex" | "oklch";    // Color output format
  resolveReferences: boolean;      // Flatten aliases to direct values
  // Style export options
  exportTextStyles: boolean;
  exportEffectStyles: boolean;
  selectedTextStyles: string[];    // Text style IDs to export
  selectedEffectStyles: string[];  // Effect style IDs to export
}
```

## Development Notes

- **UI Build:** Uses `vite-plugin-singlefile` to inline all assets (required by Figma)
- **Plugin Build:** Outputs IIFE format to `dist/code.js`
- **Build Target:** ES2017 (required - Figma sandbox doesn't support ES2019+ features like optional catch binding)
- **TypeScript:** Strict mode enabled with no unused locals/parameters
- **No Source Maps:** Disabled in plugin build for cleaner output

## Testing in Figma

1. Run `npm run build`
2. In Figma: Plugins → Development → Import plugin from manifest
3. Select `manifest.json` in this directory
4. Run plugin from Plugins → Development menu
