# DTCG Token Exporter

A Figma plugin that exports Figma Variables and Styles to [W3C Design Tokens Community Group (DTCG)](https://design-tokens.github.io/community-group/format/) format JSON files.

## Purpose

This plugin bridges the gap between Figma's native Variables and Styles systems and the emerging W3C DTCG standard for design tokens. It allows design system teams to:

- Export Figma Variables as standardized, framework-agnostic JSON
- Export Text Styles as typography composite tokens
- Export Effect Styles (shadows) as shadow composite tokens
- Maintain a single source of truth in Figma
- Generate tokens consumable by any platform (web, iOS, Android, etc.)
- Support multi-mode designs (light/dark themes, responsive breakpoints, etc.)

## Features

### Preview Tab
- **Visual Token Browser**: Browse all tokens with visual previews
- **Collection Navigation**: Sidebar with collection/group tree and token counts
- **Mode Switching**: Toggle between collection modes (Light/Dark, etc.)
- **Token Cards**: Visual cards for colors, sizes, typography, shadows, and more

### Export Tab
- **Collection & Mode Selection**: Choose which variable collections and modes to export
- **Style Export**: Export Text Styles (typography) and Effect Styles (shadows)
- **Multiple Output Files**: Generates separate JSON files per collection-mode
- **Color Formats**: Export colors as hex (default) or OKLCH (for Tailwind v4)
- **Reference Handling**: Keep token references or resolve them to actual values
- **Descriptions**: Optionally include variable descriptions in output
- **Preview & Download**: Preview generated JSON, download individually or as ZIP

## Installation

### For Development

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the plugin:
   ```bash
   npm run build
   ```
4. In Figma Desktop, go to **Plugins > Development > Import plugin from manifest...**
5. Select the `manifest.json` file from this directory

### For Production

1. Build the plugin: `npm run build`
2. The `dist/` folder contains the compiled plugin
3. Publish to Figma Community or distribute the manifest internally

## Usage

1. Open a Figma file that contains Variables and/or Styles
2. Run the plugin: **Plugins > Development > DTCG Token Exporter**

### Preview Tab
- Browse your tokens visually with the token grid
- Use the sidebar to navigate collections and groups
- Switch between modes using the mode selector
- View Text Styles and Effect Styles in the Styles section

### Export Tab
1. Select collections and modes from the sidebar
2. Optionally select Text Styles and Effect Styles to export
3. Configure options in the toolbar:
   - **Descriptions**: Add `$description` field to tokens
   - **Resolve refs**: Flatten aliases to actual values
   - **Colors**: `hex` or `oklch` format
4. Click **Generate tokens**
5. Preview the output, copy individual files or download all as ZIP

## Output Format

The plugin generates DTCG-compliant JSON files with the naming convention:
```
{collection-name}-{mode-name}.json
```

### Example Output

For a "Colors" collection with "Light" mode:

**colors-light.json**
```json
{
  "brand": {
    "primary": {
      "$value": "#3b82f6",
      "$type": "color",
      "$description": "Primary brand color"
    },
    "secondary": {
      "$value": "#10b981",
      "$type": "color"
    }
  },
  "text": {
    "default": {
      "$value": "{brand.primary}",
      "$type": "color"
    }
  }
}
```

### Token Types

| Figma Type | DTCG Type | Output Example |
|------------|-----------|----------------|
| Color | `color` | `"#3b82f6"` or `{ colorSpace: "oklch", components: [...] }` |
| Number (dimension) | `dimension` | `{ "value": 16, "unit": "px" }` |
| Number (other) | `number` | `1.5` |
| String | `fontFamily` | `"Inter"` |
| Boolean | - | `1` or `0` |
| Text Style | `typography` | Composite token with font properties |
| Effect Style | `shadow` | Composite token with shadow properties |

### Typography Token Example

**typography.json**
```json
{
  "heading": {
    "h1": {
      "$value": {
        "fontFamily": "Inter",
        "fontSize": { "value": 32, "unit": "px" },
        "fontWeight": 700,
        "lineHeight": 1.2,
        "letterSpacing": { "value": -0.5, "unit": "px" }
      },
      "$type": "typography"
    }
  }
}
```

### Shadow Token Example

**shadows.json**
```json
{
  "elevation": {
    "md": {
      "$value": [
        {
          "offsetX": { "value": 0, "unit": "px" },
          "offsetY": { "value": 4, "unit": "px" },
          "blur": { "value": 8, "unit": "px" },
          "spread": { "value": 0, "unit": "px" },
          "color": "#00000026"
        }
      ],
      "$type": "shadow"
    }
  }
}
```

### References

When "Resolve references" is **disabled**, variable aliases are preserved:
```json
{
  "$value": "{colors.brand.primary}"
}
```

When **enabled**, aliases are resolved to their actual values:
```json
{
  "$value": "#3b82f6"
}
```

## OKLCH Color Format

For Tailwind v4 compatibility, colors can be exported in OKLCH format:

```json
{
  "$value": {
    "colorSpace": "oklch",
    "components": [0.628, 0.258, 264.1],
    "alpha": 1
  },
  "$type": "color"
}
```

The conversion uses accurate sRGB to OKLCH color space transformation.

## Technical Details

### Architecture

```
src/
├── code.ts                    # Figma sandbox (main plugin code)
├── lib/
│   ├── extract.ts             # Variable & style extraction from Figma API
│   ├── convert.ts             # DTCG format conversion
│   └── stylesPreview.ts       # Mode-aware style preview extraction
├── types/
│   └── dtcg.ts                # TypeScript type definitions
└── ui/
    ├── App.tsx                # Main app with tab navigation
    ├── components/
    │   ├── Tabs.tsx           # Tab bar component
    │   ├── preview/           # Preview tab (token browser)
    │   │   ├── PreviewTab.tsx
    │   │   ├── CollectionSidebar.tsx
    │   │   ├── TokenGrid.tsx
    │   │   └── cards/         # Visual token cards (11 types)
    │   └── export/            # Export tab (JSON export)
    │       ├── ExportTab.tsx
    │       ├── CollectionSelector.tsx
    │       ├── StyleSelector.tsx
    │       └── FilePreview.tsx
    ├── styles/                # Modular CSS
    │   ├── variables.css      # Design tokens
    │   ├── components.css     # Shared components
    │   ├── preview.css        # Preview tab styles
    │   └── export.css         # Export tab styles
    ├── types/
    │   └── ui.ts              # UI-specific types
    └── utils/
        └── tokenHelpers.ts    # Token flattening & grouping
```

### Figma Plugin Structure

- **Sandbox** (`code.ts`): Runs in Figma's restricted environment with access to `figma.*` APIs
- **UI** (`ui/`): React app running in an iframe, communicates via `postMessage`

### Variable Extraction

The plugin uses Figma's async Variables API:
- `figma.variables.getLocalVariableCollectionsAsync()`
- `figma.variables.getLocalVariablesAsync()`
- `figma.variables.getVariableByIdAsync()`

### Cross-Collection References

The plugin correctly handles references across collections by building a complete variable map before conversion. For example, a "Components" collection can reference tokens from a "Primitives" collection.

### Build System

- **Vite** for fast builds and HMR during development
- **vite-plugin-singlefile** to inline all assets into a single HTML file (required for Figma plugins)
- Separate build configs for plugin code and UI

## Development

### Commands

```bash
# Development mode (watch both plugin and UI)
npm run dev

# Production build
npm run build

# Build plugin code only
npm run build:plugin

# Build UI only
npm run build:ui
```

### Project Structure

| File | Purpose |
|------|---------|
| `manifest.json` | Figma plugin configuration |
| `vite.config.ts` | Vite config for UI build |
| `vite.config.plugin.ts` | Vite config for plugin sandbox code |
| `tsconfig.json` | TypeScript configuration |

### Adding New Features

1. **New export option**: Add to `ExportConfig` in `src/types/dtcg.ts`, update `ExportTab.tsx`, handle in `convert.ts`
2. **New token type**: Update `convertValue()` and `inferType()` in `convert.ts`, add card in `ui/components/preview/cards/`
3. **New token card**: Create component in `ui/components/preview/cards/`, add styles to `preview.css`
4. **UI styling**: Update modular CSS in `src/ui/styles/`

## Consuming the Output

### Tailwind v4

Create a script to convert DTCG JSON to CSS theme variables:

```css
@import "tailwindcss";

@theme {
  --color-brand-primary: #3b82f6;
  --color-brand-secondary: #10b981;
  --spacing-sm: 8px;
  --spacing-md: 16px;
}
```

### Style Dictionary

DTCG format is compatible with [Style Dictionary](https://amzn.github.io/style-dictionary/) for multi-platform token generation.

### CSS Custom Properties

Transform tokens to CSS variables for direct browser use:

```css
:root {
  --brand-primary: #3b82f6;
  --spacing-md: 16px;
}
```

## Limitations

- Only exports **local** variables and styles (not from linked libraries)
- Boolean values are converted to `1`/`0` (no native DTCG boolean type)
- Only DROP_SHADOW and INNER_SHADOW effect types are exported (not blur, background blur)
- Text Styles with variable bindings resolve to the first mode's values in preview

## License

MIT
