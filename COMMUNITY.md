# Figma Community Publishing Content

Copy-paste ready content for publishing DTCG Token Exporter to Figma Community.

---

## Plugin Name

DTCG Token Exporter

---

## Tagline

Export Figma Variables and Styles to W3C Design Tokens format

---

## Description

**DTCG Token Exporter** converts your Figma Variables and Styles into the W3C Design Tokens Community Group (DTCG) standard JSON format—the emerging industry standard for design tokens.

### What it does

- **Export Variables**: Convert all your Figma Variable collections to DTCG-compliant JSON
- **Export Text Styles**: Typography tokens with font family, size, weight, line height, and letter spacing
- **Export Effect Styles**: Shadow tokens (drop shadows and inner shadows)
- **Multi-mode Support**: Export different modes (Light/Dark, Responsive, Brands) as separate files
- **Preview Tokens**: Visual browser to inspect all your tokens before export

### Key Features

**Visual Token Browser**

- Browse all tokens with visual previews (colors, sizes, typography, shadows)
- Navigate by collection, group, or style type
- Switch between modes to see different values

**Flexible Export Options**

- Choose which collections, modes, and styles to export
- Include/exclude token descriptions
- Export colors as hex or OKLCH (Tailwind v4 compatible)
- Keep variable references or resolve them to final values
- Download individual files or all as ZIP

### Output Format

The plugin generates standards-compliant DTCG JSON that works with:

- Style Dictionary
- Tailwind CSS v4
- Any token transformation tool that supports DTCG format

### Example Output

```json
{
  "brand": {
    "primary": {
      "$value": "#3b82f6",
      "$type": "color",
      "$description": "Primary brand color"
    }
  }
}
```

### Use Cases

- **Design System Teams**: Export tokens for multi-platform development
- **Developers**: Get design tokens in a framework-agnostic format
- **Design Ops**: Automate token handoff from Figma to code

### Privacy & Data

This plugin:

- Runs entirely in your browser
- Does NOT send any data to external servers
- Does NOT require an account or login
- Only reads your Variables and Styles (read-only)

---

## Category

Design tools

---

## Tags

design tokens, DTCG, variables, export, W3C, design system, CSS, JSON, typography, colors, styles, tokens

---

## Support

**Email**: prasadpatewar39@gmail.com
**Documentation**: https://github.com/INNOVATIVEGAMER/ds-plugin
**Issues**: https://github.com/INNOVATIVEGAMER/ds-plugin/issues

---

## Network Access

None

---

## Security Disclosure

| Field | Value |
|-------|-------|
| Data Collection | None |
| Data Storage | None |
| Network Requests | None |
| Third-Party Services | None |

This plugin only reads local Figma file data (Variables and Styles) and exports it to the user's device. No data is transmitted externally.
