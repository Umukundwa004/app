# Tailwind CSS Setup

This project now uses Tailwind CSS CLI for styling.

## Commands

### Build CSS (Production)
```bash
npm run build:css
```
This compiles and minifies Tailwind CSS from `src/input.css` to `public/css/output.css`.

### Watch Mode (Development)
```bash
npm run watch:css
```
This watches for changes and automatically rebuilds the CSS file.

## File Structure

- `src/input.css` - Source CSS file with Tailwind directives
- `public/css/output.css` - Compiled CSS file (generated, do not edit)
- `tailwind.config.js` - Tailwind configuration file

## Custom Configuration

The Tailwind config includes custom colors:
- `cream` - #F5EFE7
- `brand-green` - #1F4E34
- `brand-green-dark` - #173E2A
- `accent-orange` - #E67A2B
- `charcoal` - #1A1A1A
- `muted` - #6B6B6B

## Usage in HTML

Replace the CDN script tag:
```html
<!-- Remove this -->
<script src="https://cdn.tailwindcss.com"></script>

<!-- Add this -->
<link rel="stylesheet" href="/css/output.css">
```

## Development Workflow

1. Start the watch mode: `npm run watch:css`
2. Make changes to your HTML or `src/input.css`
3. The CSS will automatically rebuild
4. Refresh your browser to see changes

## Before Deployment

Always run `npm run build:css` before deploying to production.
