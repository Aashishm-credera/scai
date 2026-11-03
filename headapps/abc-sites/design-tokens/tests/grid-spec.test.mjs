import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

/**
 * Pins the generated layout tokens to the Figma "Grid Layouts" page (user story 236856), so a
 * Figma export that moves a breakpoint, margin, gutter or the container cap fails here instead of
 * silently reshaping every page.
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const GENERATED = path.join(ROOT, 'src/design-system/tokens/generated');
const read = (file) => fs.readFileSync(path.join(GENERATED, file), 'utf8');

const FIGMA_GRID = [
  { mode: 'S · Mobile', minWidth: 0, columns: 6, pageMargin: 20, gutter: 20 },
  { mode: 'M · Tablet', minWidth: 480, columns: 12, pageMargin: 32, gutter: 22 },
  { mode: 'L · Desktop', minWidth: 1024, columns: 12, pageMargin: 64, gutter: 23 },
  { mode: 'XL · Large desktop', minWidth: 1600, columns: 12, pageMargin: 96, gutter: 24 },
];
const CONTAINER_CAP = 1280;
const REM = 16;

const primitives = Object.fromEntries(
  [...read('primitives.css').matchAll(/(--abc-[\w-]+):\s*([\d.]+)rem;/g)].map(([, name, rem]) => [
    name,
    Number(rem) * REM,
  ])
);

/** semantic.css declares mobile values on :root, then overrides them per min-width @media. */
function semanticBlocks() {
  const css = read('semantic.css');
  const blocks = { 0: css.slice(0, css.indexOf('@media')) };
  for (const match of css.matchAll(/@media \(min-width: (\d+)px\) \{([\s\S]*?)\n\}/g)) {
    blocks[Number(match[1])] = match[2];
  }
  return blocks;
}

function tokenPx(block, name) {
  const value = new RegExp(`${name}:\\s*var\\((--abc-[\\w-]+)\\);`).exec(block)?.[1];
  assert.ok(value, `${name} is not declared in this block`);
  return primitives[value];
}

test('breakpoints are the Figma CSS thresholds, with Tailwind sm: and 2xl: switched off', () => {
  const theme = read('theme.css');
  const breakpoint = (name) => new RegExp(`--breakpoint-${name}:\\s*([^;]+);`).exec(theme)?.[1];

  assert.equal(breakpoint('md'), '30rem'); // 480px, M
  assert.equal(breakpoint('lg'), '64rem'); // 1024px, L
  assert.equal(breakpoint('xl'), '100rem'); // 1600px, XL
  assert.equal(breakpoint('sm'), 'initial');
  assert.equal(breakpoint('2xl'), 'initial');
});

for (const { mode, minWidth, pageMargin, gutter } of FIGMA_GRID) {
  test(`${mode}: page margin ${pageMargin}px and gutter ${gutter}px`, () => {
    const block = semanticBlocks()[minWidth];
    assert.ok(block, `no layout tokens for min-width ${minWidth}px`);
    assert.equal(tokenPx(block, '--abc-layout-container-page-margin-inline'), pageMargin);
    assert.equal(tokenPx(block, '--abc-layout-container-grid-column-gap'), gutter);
  });
}

test(`the container cap is ${CONTAINER_CAP}px in every mode`, () => {
  const blocks = semanticBlocks();
  assert.equal(tokenPx(blocks[0], '--abc-layout-container-max-width'), CONTAINER_CAP);
  for (const minWidth of [480, 1024, 1600]) {
    assert.doesNotMatch(
      blocks[minWidth],
      /--abc-layout-container-max-width:/,
      `the cap is overridden at ${minWidth}px`
    );
  }
});

test('BaseRow lays out 6 columns on mobile and 12 from M up', () => {
  const row = fs.readFileSync(
    path.join(ROOT, 'src/design-system/atoms/BaseRow/BaseRow.tsx'),
    'utf8'
  );
  const columns = FIGMA_GRID.map((mode) => mode.columns);
  assert.deepEqual(columns, [6, 12, 12, 12]);
  assert.match(row, /\bgrid-cols-6\b/);
  assert.match(row, /\bmd:grid-cols-12\b/);
});
