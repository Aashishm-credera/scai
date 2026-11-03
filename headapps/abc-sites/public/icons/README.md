# abc icon assets

This directory is the single SVG source consumed by Next.js, SitecoreAI/XM Cloud, and Storybook.

For Sitecore backend field setup, Content SDK and React examples, accessibility, token styling,
sprint updates, troubleshooting, and pull-request scope, see [`docs/ICONS.md`](../../docs/ICONS.md).

Assets must be exported from the approved Figma sections recorded in
`design-tokens/icons/inventory.json`; do not redraw or substitute them. Keep the inventory paths
and kebab-case filenames unchanged. Build and sanitize the registry with:

```bash
npm run icons:build
```

CI validates the committed output without writing:

```bash
npm run icons:check
npm test
```

Known unsafe source exports are listed in
`design-tokens/icons/icon-asset-exceptions.json`. They remain in the registry for Figma
traceability, render the approved placeholder fallback, and must be replaced only with a safe,
vector-only export of the same artwork.

The processor rejects inventory mismatches, executable SVG content, event handlers, remote
resources, unsafe links, and invalid filenames. It removes editor metadata and normalizes
monochrome artwork to `currentColor` without flattening intentional multicolor artwork.
