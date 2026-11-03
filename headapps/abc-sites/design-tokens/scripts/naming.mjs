import {
  KNOWN_CODE_SYNTAX_COLLISIONS,
  PATH_DERIVED_NAME_PREFIXES,
  ROOT_NAME_OVERRIDES,
} from '../token.config.mjs';

export function toKebabSegment(segment) {
  return String(segment)
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

export const toKebabPath = (segments) => segments.map(toKebabSegment).filter(Boolean).join('-');

/** Pull `--abc-*` out of Figma's Web codeSyntax when it is a valid CSS var() expression. */
export function extractFigmaVariable(token) {
  const web = token?.$extensions?.['com.figma.codeSyntax']?.Web;
  if (typeof web !== 'string') return null;
  const match = web.match(/^var\((--[a-zA-Z_][a-zA-Z0-9_-]*)\)$/);
  return match ? match[1] : null;
}

/** Resolve the one CSS name used by validation and every generated output. */
export function getCssVariableName({ path, segments, figmaVariable }) {
  const rootOverride = ROOT_NAME_OVERRIDES[segments[0]];
  if (rootOverride) {
    return `--abc-${toKebabPath([rootOverride, ...segments.slice(1)])}`;
  }

  if (PATH_DERIVED_NAME_PREFIXES.some((prefix) => path.startsWith(prefix))) {
    return `--abc-${toKebabPath(segments)}`;
  }

  return figmaVariable ?? `--abc-${toKebabPath(segments)}`;
}

export function isKnownCodeSyntaxCollision(layer, cssName, paths) {
  const layerRules =
    KNOWN_CODE_SYNTAX_COLLISIONS[layer] ??
    (layer.startsWith('Breakpoint/') ? KNOWN_CODE_SYNTAX_COLLISIONS['Breakpoint/*'] : undefined);
  const allowedPaths = layerRules?.[cssName];
  return Boolean(allowedPaths && paths.every((path) => allowedPaths.includes(path)));
}
