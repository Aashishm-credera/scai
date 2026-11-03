import assert from 'node:assert/strict';
import test from 'node:test';

import { parseTokenJson, validateTokenSource } from '../scripts/validate.mjs';

const token = (value, type, web) => ({
  ...(web ? { $extensions: { 'com.figma.codeSyntax': { Web: `var(${web})` } } } : {}),
  $value: value,
  $type: type,
});

function validSource() {
  const breakpointSet = (value) => ({ spacing: { page: { inline: token(value, 'number') } } });
  return {
    '_Primitive/Value': {
      color: { white: token('#ffffff', 'color', '--abc-color-white') },
      space: { 4: token(16, 'number', '--abc-space-4') },
    },
    'Color/Light': {
      surface: { primary: token('{color.white}', 'color', '--abc-surface-primary') },
    },
    'Base/Base': {
      font: { family: { body: token('Arial', 'text', '--abc-font-family-body') } },
    },
    'Breakpoint/sm': breakpointSet('{space.4}'),
    'Breakpoint/md': breakpointSet(24),
    'Breakpoint/lg': breakpointSet(32),
    'Breakpoint/xl': breakpointSet(40),
    $metadata: {
      tokenSetOrder: [
        '_Primitive/Value',
        'Color/Light',
        'Base/Base',
        'Breakpoint/sm',
        'Breakpoint/md',
        'Breakpoint/lg',
        'Breakpoint/xl',
      ],
    },
  };
}

test('accepts the supported #236853 token-set shape', () => {
  assert.deepEqual(validateTokenSource(validSource()), []);
});

test('reports malformed JSON without throwing a raw stack trace', () => {
  const result = parseTokenJson('{"color": }', 'fixture.json');
  assert.equal(result.errors[0].code, 'invalid-json');
  assert.match(result.errors[0].reason, /JSON|Unexpected/i);
});

test('rejects duplicate JSON keys before JSON.parse can hide them', () => {
  const result = parseTokenJson('{"group":{"same":1,"same":2}}', 'fixture.json');
  assert.equal(result.errors[0].code, 'duplicate-json-key');
  assert.equal(result.errors[0].tokenPath, 'group.same');
});

test('reports invalid colors and units with token paths and expected formats', () => {
  const source = validSource();
  source['_Primitive/Value'].color.white.$value = '#xyz';
  source['_Primitive/Value'].space['4'] = token('12pt', 'dimension');

  const errors = validateTokenSource(source);
  assert.ok(
    errors.some((error) => error.code === 'invalid-color' && error.tokenPath === 'color.white')
  );
  assert.ok(errors.some((error) => error.code === 'invalid-unit' && error.tokenPath === 'space.4'));
});

test('rejects references to missing tokens', () => {
  const source = validSource();
  source['Color/Light'].surface.primary.$value = '{color.does-not-exist}';

  const errors = validateTokenSource(source);
  assert.ok(
    errors.some(
      (error) => error.code === 'missing-reference' && error.tokenPath === 'surface.primary'
    )
  );
});

test('rejects circular references before generation', () => {
  const source = validSource();
  source['_Primitive/Value'].space['4'].$value = '{space.8}';
  source['_Primitive/Value'].space['8'] = token('{space.4}', 'number');

  const errors = validateTokenSource(source);
  assert.ok(errors.some((error) => error.code === 'circular-reference'));
});

test('rejects duplicate effective CSS names', () => {
  const source = validSource();
  source['_Primitive/Value'].color.black = token('#000000', 'color', '--abc-color-white');

  const errors = validateTokenSource(source);
  assert.ok(
    errors.some(
      (error) => error.code === 'duplicate-output-name' && error.tokenPath === 'color.black'
    )
  );
});

test('rejects breakpoint sets whose semantic shapes drift', () => {
  const source = validSource();
  delete source['Breakpoint/lg'].spacing.page.inline;

  const errors = validateTokenSource(source);
  assert.ok(
    errors.some(
      (error) => error.code === 'breakpoint-shape-mismatch' && error.set === 'Breakpoint/lg'
    )
  );
});
