# Sitecore Content SDK — Next.js App Router + Cache Components

This starter matches the default **nextjs-app-router** template, with **Next.js Cache Components** (`cacheComponents`), **`getSitecorePage`**, **`getSitecoreDictionary`**, and **`getSitecoreErrorPage`** (Not found / Server Error) helpers that apply Sitecore cache tags for tag-based on-demand revalidation, plus a single **`POST /api/revalidate`** route that accepts explicit cache tags or Sitecore webhook-style payloads.

Use the **`nextjs-app-router`** template if you do not need Cache Components or tag revalidation wiring.

[SitecoreAI Content SDK Documentation](https://doc.sitecore.com/sai/en/developers/content-sdk/sitecore-content-sdk-for-sitecoreai.html)

## Storybook design system

The migrated Storybook is intentionally limited to the approved catalog:

- **Welcome**
- **Design:** Design Tokens, Colors, Typography, Spacing, Radius, Elevation, Breakpoints, Icons, and Logos
- **Atoms:** Button, Column, Container, Image, Row, and Tooltip

From `headapps/abc-sites`, install dependencies and start Storybook:

```bash
npm install
npm run storybook
```

Open <http://localhost:6006>. Storybook does not require Sitecore credentials.

Useful validation commands:

```bash
npm run lint
npm run format:check
npm run test
npm run test:coverage
npm run test:storybook
npm run build-storybook
```
