function setNested(target, segments, value) {
  let cursor = target;
  for (const segment of segments.slice(0, -1)) {
    if (!Object.hasOwn(cursor, segment)) {
      cursor[segment] = {};
    } else if (
      typeof cursor[segment] !== 'object' ||
      cursor[segment] === null ||
      Array.isArray(cursor[segment])
    ) {
      cursor[segment] = { $value: cursor[segment] };
    }
    cursor = cursor[segment];
  }
  const leaf = segments.at(-1);
  if (typeof cursor[leaf] === 'object' && cursor[leaf] !== null && !Array.isArray(cursor[leaf])) {
    cursor[leaf].$value = value;
  } else {
    cursor[leaf] = value;
  }
}

function recordTree(records, valueForRecord) {
  const tree = {};
  for (const record of records) {
    if (record.resolved === undefined) continue;
    setNested(tree, record.segments, valueForRecord(record));
  }
  return tree;
}

function mergeRecords(target, records, valueForRecord) {
  for (const record of records) {
    if (record.resolved === undefined) continue;
    setNested(target, record.segments, valueForRecord(record));
  }
}

export function buildRuntimeTokenData({
  primitiveRecords,
  baseRecords,
  semanticRecords,
  breakpointRecords,
  breakpointOrder,
  breakpoints,
  typography,
  shadows,
  valueForRecord,
}) {
  const tokens = {};
  mergeRecords(tokens, primitiveRecords, valueForRecord);
  mergeRecords(tokens, baseRecords, valueForRecord);
  mergeRecords(tokens, semanticRecords, valueForRecord);
  mergeRecords(tokens, breakpointRecords.sm ?? [], valueForRecord);

  const breakpointValues = Object.fromEntries(
    breakpointOrder.map((name) => [name, `${breakpoints[name].px}px`])
  );
  tokens.breakpoint = breakpointValues;

  tokens.typography = {};
  for (const style of typography) {
    setNested(tokens.typography, [style.role, style.size], {
      fontFamily: style.family,
      fontWeight: style.weight,
      fontSize: style.sizeByBp.sm,
      lineHeight: style.lineByBp.sm,
    });
  }

  tokens.shadow = {};
  for (const shadow of shadows) {
    const key = shadow.name.replace(/^--abc-(?:shadow-)?/, '');
    tokens.shadow[key] = shadow.value;
  }

  const breakpointTokens = Object.fromEntries(
    breakpointOrder.map((name) => [name, recordTree(breakpointRecords[name] ?? [], valueForRecord)])
  );

  const cssVariables = {};
  mergeRecords(
    cssVariables,
    [...primitiveRecords, ...baseRecords, ...semanticRecords, ...(breakpointRecords.sm ?? [])],
    (record) => `var(${record.cssName})`
  );

  return { tokens, breakpoints: breakpointValues, breakpointTokens, cssVariables };
}

export function renderTypeScriptModule(data, sourceName) {
  const json = (value) => JSON.stringify(value, null, 2);
  return `/**
 * AUTO-GENERATED from ${sourceName} by design-tokens/scripts/generate.mjs.
 * Do not edit by hand. Run \`npm run tokens:build\`.
 */

export const breakpoints = ${json(data.breakpoints)} as const;

/** Base (sm) runtime values, merged by original Figma token path. */
export const tokens = ${json(data.tokens)} as const;

/** Complete responsive token sets for JavaScript layout/animation decisions. */
export const breakpointTokens = ${json(data.breakpointTokens)} as const;

/** CSS var() references keyed by the same token paths as \`tokens\`. */
export const cssVariables = ${json(data.cssVariables)} as const;

export type DesignTokens = typeof tokens;
export type DesignTokenBreakpoints = keyof typeof breakpoints;
`;
}
