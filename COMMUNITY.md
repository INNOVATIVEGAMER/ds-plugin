# Figma Community Publishing Guide

This document contains all the content needed to publish the DTCG Token Exporter to Figma Community.

---

## Plugin Name

**DTCG Token Exporter**

---

## Tagline (short description)

Export Figma Variables and Styles to W3C Design Tokens format

---

## Full Description

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

**Design tools** or **Utilities**

---

## Tags/Keywords (up to 12)

1. design tokens
2. DTCG
3. variables
4. export
5. W3C
6. design system
7. CSS
8. JSON
9. typography
10. colors
11. styles
12. tokens

---

## Support Information

**Support Email**: [YOUR_EMAIL@example.com]
**Website/Documentation**: [YOUR_GITHUB_URL]
**Issues**: [YOUR_GITHUB_URL]/issues

---

## Network Access Declaration

**None** - This plugin does not make any network requests. All processing happens locally in the browser.

---

## Security Disclosure (recommended)

**Data Collection**: None
**Data Storage**: None
**Network Requests**: None
**Third-Party Services**: None

This plugin only reads local Figma file data (Variables and Styles) and exports it to the user's device. No data is transmitted externally.

---

## Visual Assets Checklist

| Asset | Size | Status |
|-------|------|--------|
| Plugin Icon | 128 x 128px | See `assets/icon.svg` |
| Cover Image | 1920 x 1080px | TODO: Create |
| Carousel Images | 1920 x 1080px | TODO: Create (optional, up to 9) |

### Recommended Cover Image Content

Show the plugin UI with:
1. The Preview tab displaying a collection of tokens with visual cards
2. The Export tab showing generated JSON output
3. A before/after: Figma Variables panel → DTCG JSON

---

## Pre-Submission Checklist

- [ ] Plugin icon created (128x128px)
- [ ] Cover image created (1920x1080px)
- [ ] Plugin tested on files with no Variables
- [ ] Plugin tested on files with no Styles
- [ ] Plugin tested with large collections (100+ variables)
- [ ] Error messages are user-friendly
- [ ] All features work as described
- [ ] Support contact information added
- [ ] Two-factor authentication enabled on Figma account
- [ ] Using Figma Desktop app for submission
