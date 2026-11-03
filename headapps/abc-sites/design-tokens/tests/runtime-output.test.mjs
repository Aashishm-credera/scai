import assert from 'node:assert/strict';
import test from 'node:test';

import { buildRuntimeTokenData, renderTypeScriptModule } from '../scripts/runtime-output.mjs';

const record = (path, resolved, cssName = `--abc-${path.replaceAll('.', '-')}`) => ({
  path,
  segments: path.split('.'),
  resolved,
  cssName,
});

test('builds nested base tokens and discrete breakpoint token sets', () => {
  const data = buildRuntimeTokenData({
    primitiveRecords: [record('color.brand.primary', '#c00')],
    baseRecords: [],
    semanticRecords: [record('spacing.page.inline', '1rem')],
    breakpointRecords: {
      sm: [record('spacing.page.inline', '1rem')],
      md: [record('spacing.page.inline', '2rem')],
    },
    breakpointOrder: ['sm', 'md'],
    breakpoints: { sm: { px: 0 }, md: { px: 768 } },
    typography: [],
    shadows: [],
    valueForRecord: (entry) => entry.resolved,
  });

  assert.equal(data.tokens.color.brand.primary, '#c00');
  assert.equal(data.tokens.spacing.page.inline, '1rem');
  assert.equal(data.breakpointTokens.md.spacing.page.inline, '2rem');
  assert.deepEqual(data.breakpoints, { sm: '0px', md: '768px' });
  assert.equal(data.cssVariables.spacing.page.inline, 'var(--abc-spacing-page-inline)');
});

test('renders a typed ES module with stable named exports', () => {
  const output = renderTypeScriptModule(
    {
      tokens: { color: { white: '#fff' } },
      breakpoints: { sm: '0px' },
      breakpointTokens: { sm: {} },
      cssVariables: { color: { white: 'var(--abc-color-white)' } },
    },
    'fixture.json'
  );

  assert.match(output, /export const tokens =/);
  assert.match(output, /export const breakpointTokens =/);
  assert.match(output, /export type DesignTokens = typeof tokens/);
});
