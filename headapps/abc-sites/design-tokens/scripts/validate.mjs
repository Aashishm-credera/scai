import fs from 'node:fs';

import {
  BREAKPOINT_ORDER,
  NON_EMITTED_PRIMITIVE_GROUPS,
  REQUIRED_TOKEN_SETS,
  SUPPORTED_TOKEN_TYPES,
  UNREPRESENTABLE_TOKENS,
} from '../token.config.mjs';
import { extractFigmaVariable, getCssVariableName, isKnownCodeSyntaxCollision } from './naming.mjs';

const REFERENCE_RE = /\{([^{}]+)\}/g;
const CSS_VARIABLE_RE = /^var\(--[a-zA-Z_][a-zA-Z0-9_-]*\)$/;
const CSS_COLOR_RE =
  /^(#[0-9a-f]{3,8}|(?:(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color|linear-gradient|radial-gradient|conic-gradient))\(.+\)|transparent|currentColor)$/i;
const LENGTH_RE = /^-?(?:\d+|\d*\.\d+)(?:px|rem|em|%|vw|vh|vmin|vmax|ch|ex)$/i;
const DURATION_RE = /^(?:\d+|\d*\.\d+)(?:ms|s)$/i;
const NUMBER_TYPES = new Set([
  'number',
  'fontSizes',
  'paragraphSpacing',
  'x',
  'y',
  'blur',
  'spread',
]);
const LENGTH_TYPES = new Set(['dimension', 'letterSpacing', 'lineHeights', 'paragraphIndent']);
const STRING_TYPES = new Set([
  'fontFamily',
  'fontFamilies',
  'fontWeight',
  'fontWeights',
  'string',
  'text',
  'textCase',
  'textDecoration',
  'type',
]);
const COMPOSITE_TYPES = new Set([
  'border',
  'gradient',
  'shadow',
  'strokeStyle',
  'transition',
  'typography',
]);

function printable(value) {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function issue(code, tokenPath, value, expected, reason, set) {
  return { code, tokenPath, value, expected, reason, set };
}

function isPlainObject(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function referencesIn(value) {
  if (typeof value === 'string')
    return [...value.matchAll(REFERENCE_RE)].map((match) => match[1].trim());
  if (Array.isArray(value)) return value.flatMap(referencesIn);
  if (isPlainObject(value)) return Object.values(value).flatMap(referencesIn);
  return [];
}

function validateLiteral(record, errors) {
  const { type, value, path: tokenPath, setName: set } = record;
  if (referencesIn(value).length > 0) return;

  if (type === 'color') {
    const validObject =
      isPlainObject(value) &&
      typeof value.colorSpace === 'string' &&
      Array.isArray(value.components);
    if (!(typeof value === 'string' && CSS_COLOR_RE.test(value.trim())) && !validObject) {
      errors.push(
        issue(
          'invalid-color',
          tokenPath,
          value,
          'a CSS color (#RGB[A], #RRGGBB[AA], rgb(), hsl(), oklch(), etc.) or DTCG color object',
          'The color value is not in a supported format.',
          set
        )
      );
    }
    return;
  }

  if (NUMBER_TYPES.has(type)) {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      errors.push(
        issue(
          'invalid-number',
          tokenPath,
          value,
          'a finite JSON number or a token reference',
          `Token type "${type}" requires a numeric value.`,
          set
        )
      );
    }
    return;
  }

  if (LENGTH_TYPES.has(type)) {
    if (!(
      (typeof value === 'number' && Number.isFinite(value)) ||
      (typeof value === 'string' && LENGTH_RE.test(value.trim()))
    )) {
      errors.push(
        issue(
          'invalid-unit',
          tokenPath,
          value,
          'a finite number or a length using px, rem, em, %, vw, vh, vmin, vmax, ch, or ex',
          `Token type "${type}" has an invalid unit.`,
          set
        )
      );
    }
    return;
  }

  if (type === 'duration') {
    if (typeof value !== 'string' || !DURATION_RE.test(value.trim())) {
      errors.push(
        issue(
          'invalid-duration',
          tokenPath,
          value,
          'a non-negative duration such as "150ms" or "0.2s"',
          'Duration tokens must include an ms or s unit.',
          set
        )
      );
    }
    return;
  }

  if (type === 'cubicBezier') {
    if (
      !Array.isArray(value) ||
      value.length !== 4 ||
      value.some((part) => typeof part !== 'number' || !Number.isFinite(part))
    ) {
      errors.push(
        issue(
          'invalid-easing',
          tokenPath,
          value,
          'an array of four finite numbers',
          'cubicBezier tokens must contain four numeric control points.',
          set
        )
      );
    }
    return;
  }

  if (type === 'boolean') {
    if (typeof value !== 'boolean')
      errors.push(
        issue(
          'invalid-boolean',
          tokenPath,
          value,
          'true or false',
          'Boolean token has a non-boolean value.',
          set
        )
      );
    return;
  }

  if (STRING_TYPES.has(type)) {
    const validFontWeight =
      (type === 'fontWeight' || type === 'fontWeights') &&
      typeof value === 'number' &&
      Number.isFinite(value);
    if ((!validFontWeight && typeof value !== 'string') || value === '') {
      errors.push(
        issue(
          'invalid-string',
          tokenPath,
          value,
          'a non-empty string, number for font weight, or a token reference',
          `Token type "${type}" has an invalid value.`,
          set
        )
      );
    }
    return;
  }

  if (COMPOSITE_TYPES.has(type) && !isPlainObject(value) && !Array.isArray(value)) {
    errors.push(
      issue(
        'invalid-composite',
        tokenPath,
        value,
        'an object/array matching the DTCG composite token shape',
        `Token type "${type}" requires a composite value.`,
        set
      )
    );
  }
}

function findJsonPosition(text, error) {
  const match = String(error?.message).match(/position\s+(\d+)/i);
  if (!match) return {};
  const offset = Number(match[1]);
  const before = text.slice(0, offset);
  const lines = before.split('\n');
  return { line: lines.length, column: lines.at(-1).length + 1 };
}

/** JSON.parse accepts duplicate object keys and silently keeps the last one. Walk the valid
 * source text once more so a duplicated token name cannot disappear unnoticed. */
function findDuplicateJsonKeys(text) {
  const duplicates = [];
  let index = 0;
  const skipWhitespace = () => {
    while (/\s/.test(text[index] ?? '')) index += 1;
  };
  const readString = () => {
    const start = index;
    index += 1;
    while (index < text.length) {
      if (text[index] === '\\') index += 2;
      else if (text[index++] === '"') break;
    }
    return JSON.parse(text.slice(start, index));
  };
  const readValue = (path) => {
    skipWhitespace();
    if (text[index] === '{') return readObject(path);
    if (text[index] === '[') return readArray(path);
    if (text[index] === '"') {
      readString();
      return;
    }
    while (index < text.length && !/[\s,}\]]/.test(text[index])) index += 1;
  };
  const readArray = (path) => {
    index += 1;
    let item = 0;
    while (index < text.length) {
      skipWhitespace();
      if (text[index] === ']') {
        index += 1;
        return;
      }
      readValue([...path, String(item++)]);
      skipWhitespace();
      if (text[index] === ',') index += 1;
    }
  };
  const readObject = (path) => {
    index += 1;
    const keys = new Set();
    while (index < text.length) {
      skipWhitespace();
      if (text[index] === '}') {
        index += 1;
        return;
      }
      const key = readString();
      if (keys.has(key)) duplicates.push([...path, key].join('.'));
      keys.add(key);
      skipWhitespace();
      index += 1; // colon; syntax was already checked by JSON.parse
      readValue([...path, key]);
      skipWhitespace();
      if (text[index] === ',') index += 1;
    }
  };
  readValue([]);
  return duplicates;
}

export function parseTokenJson(text, filename = 'token JSON') {
  try {
    const source = JSON.parse(text);
    const duplicateErrors = findDuplicateJsonKeys(text).map((tokenPath) =>
      issue(
        'duplicate-json-key',
        tokenPath,
        tokenPath.split('.').at(-1),
        'a unique property name within its JSON object',
        'JSON would silently discard all but the last property with this name.'
      )
    );
    return { source, errors: duplicateErrors };
  } catch (error) {
    const position = findJsonPosition(text, error);
    return {
      source: null,
      errors: [
        issue(
          'invalid-json',
          filename,
          position.line ? `line ${position.line}, column ${position.column}` : '(unknown position)',
          'valid JSON syntax',
          error instanceof Error ? error.message : String(error)
        ),
      ],
    };
  }
}

export function validateTokenSource(source, { filename = 'token JSON' } = {}) {
  const errors = [];
  if (!isPlainObject(source)) {
    return [
      issue(
        'invalid-root',
        filename,
        source,
        'a JSON object containing token sets and $metadata',
        'The document root must be an object.'
      ),
    ];
  }

  const order = source.$metadata?.tokenSetOrder;
  if (
    !Array.isArray(order) ||
    order.length === 0 ||
    order.some((name) => typeof name !== 'string')
  ) {
    errors.push(
      issue(
        'invalid-schema',
        '$metadata.tokenSetOrder',
        order,
        'a non-empty array of token-set names',
        'The export must declare a deterministic token-set order.'
      )
    );
  } else {
    const duplicates = order.filter((name, index) => order.indexOf(name) !== index);
    if (duplicates.length)
      errors.push(
        issue(
          'duplicate-token-set',
          '$metadata.tokenSetOrder',
          [...new Set(duplicates)],
          'unique token-set names',
          'The token-set order contains duplicates.'
        )
      );
    for (const setName of order) {
      if (!isPlainObject(source[setName]))
        errors.push(
          issue(
            'missing-token-set',
            setName,
            source[setName],
            'an object matching a listed token set',
            'A set listed in $metadata.tokenSetOrder is missing or invalid.'
          )
        );
    }
  }

  for (const setName of REQUIRED_TOKEN_SETS) {
    if (!isPlainObject(source[setName]))
      errors.push(
        issue(
          'missing-required-set',
          setName,
          source[setName],
          'a token-set object',
          'A required #236853 token set is missing.'
        )
      );
  }

  const setNames = Array.isArray(order)
    ? order.filter((name) => isPlainObject(source[name]))
    : Object.keys(source).filter((name) => !name.startsWith('$') && isPlainObject(source[name]));
  const records = [];

  function walk(node, segments, setName) {
    if (!isPlainObject(node)) {
      errors.push(
        issue(
          'invalid-group',
          segments.join('.') || setName,
          node,
          'an object containing token groups or a token leaf',
          'Token groups cannot be arrays, null, or primitive values.',
          setName
        )
      );
      return;
    }

    if (Object.hasOwn(node, '$value')) {
      const tokenPath = segments.join('.');
      if (typeof node.$type !== 'string' || node.$type.length === 0) {
        errors.push(
          issue(
            'missing-token-type',
            tokenPath,
            node.$type,
            'a supported non-empty $type string',
            'Every token leaf requires $type.',
            setName
          )
        );
      } else if (
        !SUPPORTED_TOKEN_TYPES.has(node.$type) &&
        !UNREPRESENTABLE_TOKENS.has(`${setName}::${tokenPath}`)
      ) {
        errors.push(
          issue(
            'unsupported-token-type',
            tokenPath,
            node.$type,
            [...SUPPORTED_TOKEN_TYPES].join(', '),
            'The token type is not enabled in token.config.mjs.',
            setName
          )
        );
      }

      const webSyntax = node.$extensions?.['com.figma.codeSyntax']?.Web;
      if (
        webSyntax !== undefined &&
        (typeof webSyntax !== 'string' || !CSS_VARIABLE_RE.test(webSyntax))
      ) {
        errors.push(
          issue(
            'invalid-code-syntax',
            tokenPath,
            webSyntax,
            'var(--valid-css-custom-property)',
            'Figma Web codeSyntax is malformed.',
            setName
          )
        );
      }

      const record = {
        setName,
        path: tokenPath,
        segments,
        type: node.$type,
        value: node.$value,
        figmaVariable: extractFigmaVariable(node),
      };
      record.cssName = getCssVariableName(record);
      records.push(record);
      if (SUPPORTED_TOKEN_TYPES.has(record.type)) validateLiteral(record, errors);
    }

    for (const [key, child] of Object.entries(node)) {
      if (key.startsWith('$')) continue;
      if (key.trim() !== key || /[.{}$\u0000-\u001f]/.test(key) || key.length === 0) {
        errors.push(
          issue(
            'invalid-token-name',
            [...segments, key].join('.'),
            key,
            'a non-empty segment without dots, braces, $, control characters, or surrounding whitespace',
            'The token name cannot be mapped predictably to CSS and JavaScript.',
            setName
          )
        );
      }
      walk(child, [...segments, key], setName);
    }
  }

  for (const setName of setNames) walk(source[setName], [], setName);
  if (records.length === 0)
    errors.push(
      issue('empty-token-source', filename, 0, 'at least one token leaf', 'No tokens were found.')
    );

  const allPaths = new Set(records.map((record) => record.path));
  for (const record of records) {
    const raw = typeof record.value === 'string' ? record.value : '';
    const refs = referencesIn(record.value);
    const withoutRefs = raw.replace(REFERENCE_RE, '');
    if (/[{}]/.test(withoutRefs))
      errors.push(
        issue(
          'invalid-reference-syntax',
          record.path,
          record.value,
          'references formatted as {token.path}',
          'The value contains unmatched reference braces.',
          record.setName
        )
      );
    for (const reference of refs) {
      if (!allPaths.has(reference))
        errors.push(
          issue(
            'missing-reference',
            record.path,
            record.value,
            `a reference to an existing token (missing: ${reference})`,
            `The referenced token "${reference}" does not exist in any declared set.`,
            record.setName
          )
        );
    }
  }

  const recordsBySetAndPath = new Map(
    records.map((record) => [`${record.setName}:${record.path}`, record])
  );
  const recordsByPath = new Map();
  for (const record of records) {
    if (!recordsByPath.has(record.path)) recordsByPath.set(record.path, []);
    recordsByPath.get(record.path).push(record);
  }
  const findReferenceTarget = (reference, fromRecord) =>
    recordsBySetAndPath.get(`${fromRecord.setName}:${reference}`) ??
    recordsBySetAndPath.get(`_Primitive/Value:${reference}`) ??
    recordsBySetAndPath.get(`Base/Base:${reference}`) ??
    recordsByPath.get(reference)?.[0];

  function resolveForValidation(record, stack = []) {
    if (typeof record.value !== 'string') return { ok: true, value: record.value };
    const refs = referencesIn(record.value);
    if (refs.length === 0) return { ok: true, value: record.value };
    let resolved = record.value;
    for (const reference of refs) {
      const target = findReferenceTarget(reference, record);
      if (!target) return { ok: false, reason: `missing reference {${reference}}` };
      const targetKey = `${target.setName}:${target.path}`;
      if (stack.includes(targetKey)) {
        return { ok: false, reason: `circular reference ${[...stack, targetKey].join(' -> ')}` };
      }
      const result = resolveForValidation(target, [...stack, targetKey]);
      if (!result.ok) return result;
      if (record.value.trim() === `{${reference}}`) return result;
      resolved = resolved.replace(`{${reference}}`, String(result.value));
    }
    return { ok: true, value: resolved };
  }

  const reportedCycles = new Set();
  for (const record of records) {
    if (referencesIn(record.value).length === 0) continue;
    const key = `${record.setName}:${record.path}`;
    const resolved = resolveForValidation(record, [key]);
    if (!resolved.ok) {
      if (
        resolved.reason.startsWith('circular reference') &&
        !reportedCycles.has(resolved.reason)
      ) {
        reportedCycles.add(resolved.reason);
        errors.push(
          issue(
            'circular-reference',
            record.path,
            record.value,
            'an acyclic reference chain',
            resolved.reason,
            record.setName
          )
        );
      }
      continue;
    }
    validateLiteral({ ...record, value: resolved.value }, errors);
  }

  // Effective output names must be unique within layers. Breakpoint modes intentionally
  // repeat the same paths/names, so each mode is checked independently.
  const layerFor = (setName) => {
    if (setName === '_Primitive/Value' || setName === 'Base/Base') return 'primitives';
    if (setName.startsWith('Breakpoint/')) return setName;
    return setName;
  };
  const namesByLayer = new Map();
  for (const record of records) {
    if (
      record.setName === '_Primitive/Value' &&
      NON_EMITTED_PRIMITIVE_GROUPS.has(record.segments[0])
    )
      continue;
    const layer = layerFor(record.setName);
    const key = `${layer}:${record.cssName}`;
    const previous = namesByLayer.get(key);
    if (previous && previous.path !== record.path) {
      if (!isKnownCodeSyntaxCollision(layer, record.cssName, [previous.path, record.path])) {
        errors.push(
          issue(
            'duplicate-output-name',
            record.path,
            record.cssName,
            'a unique effective CSS custom-property name within its output layer',
            `The generated name also belongs to "${previous.path}". Correct Figma codeSyntax or add an explicit compatibility exception.`,
            record.setName
          )
        );
      }
    } else {
      namesByLayer.set(key, record);
    }
  }

  const basePaths = new Set(
    records.filter((record) => record.setName === 'Breakpoint/sm').map((record) => record.path)
  );
  for (const breakpoint of BREAKPOINT_ORDER.filter((name) => name !== 'sm')) {
    const setName = `Breakpoint/${breakpoint}`;
    const modePaths = new Set(
      records.filter((record) => record.setName === setName).map((record) => record.path)
    );
    for (const tokenPath of modePaths) {
      if (!basePaths.has(tokenPath))
        errors.push(
          issue(
            'breakpoint-shape-mismatch',
            tokenPath,
            setName,
            'the same token path in Breakpoint/sm',
            'A responsive override has no base value.',
            setName
          )
        );
    }
    for (const tokenPath of basePaths) {
      if (!modePaths.has(tokenPath))
        errors.push(
          issue(
            'breakpoint-shape-mismatch',
            tokenPath,
            setName,
            `the same token path as Breakpoint/sm`,
            'The breakpoint mode is missing a base semantic token.',
            setName
          )
        );
    }
  }

  return errors;
}

export function validateTokenFile(filePath) {
  let text;
  try {
    text = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return {
      source: null,
      errors: [
        issue(
          'unreadable-source',
          filePath,
          null,
          'a readable JSON file',
          error instanceof Error ? error.message : String(error)
        ),
      ],
    };
  }
  const parsed = parseTokenJson(text, filePath);
  if (parsed.errors.length) return parsed;
  return {
    source: parsed.source,
    errors: validateTokenSource(parsed.source, { filename: filePath }),
  };
}

export function formatValidationErrors(errors) {
  return errors
    .map((error) =>
      [
        `ERROR [${error.code}] ${error.set ? `${error.set} :: ` : ''}${error.tokenPath}`,
        `  value:    ${printable(error.value)}`,
        `  expected: ${error.expected}`,
        `  reason:   ${error.reason}`,
      ].join('\n')
    )
    .join('\n\n');
}

export function assertValidTokenFile(filePath) {
  const result = validateTokenFile(filePath);
  if (result.errors.length) {
    const error = new Error(
      `Design-token validation failed with ${result.errors.length} error(s).\n\n${formatValidationErrors(result.errors)}`
    );
    error.name = 'TokenValidationError';
    error.validationErrors = result.errors;
    throw error;
  }
  return result.source;
}
