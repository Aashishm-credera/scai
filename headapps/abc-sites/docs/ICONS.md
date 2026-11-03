# Storybook icon and logo catalog

The approved assets shown by Storybook live in `public/icons` and `public/logos`. Their typed
React registries live in `src/design-system/design/icons` and
`src/design-system/design/logos`.

Use **Design → Icons** to search icon names, preview semantic colors and sizes, and verify
accessible labeling. Use **Design → Logos** for the supported abc and partner marks.

## Commands

```bash
npm run icons:build
npm run icons:check
npm run test
npm run test:storybook
npm run build-storybook
```

The icon pipeline owns `design-tokens/icons/inventory.json` and the generated
`icon-data.generated.ts`; do not edit generated inventory output manually.

For accessibility:

- Mark decorative icons as `aria-hidden`.
- Give meaningful standalone icons an accessible label.
- Give icon-only buttons their own accessible name.
