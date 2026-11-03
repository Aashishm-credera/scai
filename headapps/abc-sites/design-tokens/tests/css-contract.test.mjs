import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

/**
 * Guards the one thing the baseline diff cannot answer: did this export break the app?
 *
 * `tokens:breaking` reports that tokens were removed. It cannot know whether anything used them,
 *the September 2026 export dropped 328 tokens and broke nothing, because no component
 * referenced any of them. Failing on every removal would cry wolf until people stopped looking.
 *
 * These two assertions fail only when a reference actually dangles, which is the real breakage.
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/** Files the generator writes, plus the stylesheet that imports them. */
const STYLESHEETS = [
  'src/design-system/tokens/generated/primitives.css',
  'src/design-system/tokens/generated/semantic.css',
  'src/design-system/tokens/generated/theme.css',
  'src/app/globals.css',
];

const DECLARATION_RE = /^\s*(--[A-Za-z0-9_-]+)\s*:/gm;

/**
 * Requires the closing `)` or a `,` fallback separator, so a partial string such as the
 * `'color:var(--abc-foreground'` assertion inside a component test is not mistaken for a real
 * reference. Prose mentions of a variable outside `var()` are ignored for the same reason.
 */
const REFERENCE_RE = /var\(\s*(--[A-Za-z0-9-]+)\s*[,)]/g;

function readStylesheets() {
  return STYLESHEETS.map((file) => [file, fs.readFileSync(path.join(ROOT, file), 'utf8')]);
}

function declaredVariables() {
  const declared = new Set();
  for (const [, css] of readStylesheets()) {
    for (const match of css.matchAll(DECLARATION_RE)) declared.add(match[1]);
  }
  return declared;
}

function sourceFiles() {
  const files = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        // The generated stylesheets are checked separately, below.
        if (full.endsWith(path.join('src', 'design-system', 'tokens', 'generated'))) continue;
        walk(full);
        continue;
      }
      if (/\.(tsx?|css|mdx)$/.test(entry.name)) files.push(full);
    }
  };
  walk(path.join(ROOT, 'src'));
  return files;
}

test('every --abc-* variable the app references is declared by the generated CSS', () => {
  const declared = declaredVariables();
  const dangling = [];

  for (const file of sourceFiles()) {
    const contents = fs.readFileSync(file, 'utf8');
    for (const match of contents.matchAll(REFERENCE_RE)) {
      const name = match[1];
      if (!name.startsWith('--abc-')) continue; // shadcn's own vars are theme.css's business
      if (!declared.has(name)) dangling.push(`${name}  <-  ${path.relative(ROOT, file)}`);
    }
  }

  assert.deepEqual(
    dangling,
    [],
    `App code references design tokens that no longer exist.\n\n  ${dangling.join('\n  ')}\n\n` +
      'A token was removed or renamed in figma-export.json while a component still uses it. ' +
      'Check design-tokens/reports/changes.md for what moved.'
  );
});

test('the generated CSS has no dangling var() references of its own', () => {
  const declared = declaredVariables();
  const dangling = [];

  for (const [file, css] of readStylesheets()) {
    css.split('\n').forEach((line, index) => {
      for (const match of line.matchAll(REFERENCE_RE)) {
        // Only our namespace: theme.css legitimately forwards to shadcn names it does not own.
        if (!match[1].startsWith('--abc-')) continue;
        if (!declared.has(match[1])) dangling.push(`${match[1]}  <-  ${file}:${index + 1}`);
      }
    });
  }

  assert.deepEqual(
    dangling,
    [],
    `The generated CSS points at variables it never declares.\n\n  ${dangling.join('\n  ')}\n\n` +
      'This is how `.text-heading-2xl` shipped broken: the utility read ' +
      '--abc-text-heading-2xl-size, which the Figma export never provided, so the declaration ' +
      'was invalid and the font-size silently inherited.'
  );
});
