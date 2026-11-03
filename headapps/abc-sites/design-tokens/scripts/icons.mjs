#!/usr/bin/env node

import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIRECTORY, '../..');
const args = process.argv.slice(2);
const check = args.includes('--check');

function getPathArgument(name, fallback) {
  const argument = args.find((value) => value.startsWith(`--${name}=`));
  return path.resolve(argument ? argument.slice(name.length + 3) : fallback);
}

const inventoryPath = getPathArgument(
  'inventory',
  path.join(ROOT, 'design-tokens/icons/inventory.json')
);
const exceptionsPath = getPathArgument(
  'exceptions',
  path.join(ROOT, 'design-tokens/icons/icon-asset-exceptions.json')
);
const iconsRoot = getPathArgument('icons-root', path.join(ROOT, 'public/icons'));
const generatedPath = getPathArgument(
  'generated',
  path.join(ROOT, 'src/design-system/design/icons/icon-data.generated.ts')
);

const iconFields = ['id', 'name', 'category', 'group', 'sourceCategory', 'assetPath'];
const categories = new Set(['miscellaneous', 'pictoral', 'interface']);
const sourceCategories = {
  miscellaneous: 'Icon - Miscellaneous',
  pictoral: 'Icon - pictoral',
  interface: 'Icon - Interface',
};
const defaultDimensions = { width: 24, height: 24 };
const dangerousMarkup = [
  /<!DOCTYPE|<!ENTITY/i,
  /<\s*(script|foreignObject|iframe|object|embed|image|audio|video|a|style)\b/i,
  /\bon[a-z]+\s*=/i,
  /(?:href|xlink:href)\s*=\s*["'](?!#)[^"']+/i,
  /(?:javascript|vbscript|data):/i,
  /url\(\s*["']?\s*(?:https?:|\/\/)/i,
  /@import/i,
];

function resolveColorMode(icon) {
  const isMonochrome =
    icon.category === 'interface' || (icon.category === 'pictoral' && icon.group === 'strokes');
  return isMonochrome ? 'monochrome' : 'multicolor';
}

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

async function listSvgFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const absolutePath = path.join(directory, entry.name);
      return entry.isDirectory() ? listSvgFiles(absolutePath) : [absolutePath];
    })
  );
  return files.flat().filter((file) => file.endsWith('.svg'));
}

function sanitizeSvg(source, colorMode) {
  let svg = source
    .replace(/^\uFEFF/, '')
    .replace(/<\?xml[^>]*>\s*/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<metadata\b[\s\S]*?<\/metadata>\s*/gi, '')
    .replace(/\sdata-name=(['"])[^'"]*\1/g, '')
    .trim();

  if (!/^<svg\b/i.test(svg) || !/\bviewBox=(['"])[^'"]+\1/i.test(svg)) {
    throw new Error('SVG must start with <svg> and include a viewBox');
  }

  for (const pattern of dangerousMarkup) {
    if (pattern.test(svg)) throw new Error(`Rejected dangerous SVG markup: ${pattern}`);
  }

  if (colorMode === 'monochrome') {
    svg = svg
      .replace(
        /\b(fill|stroke)=(['"])(?!none\2|currentColor\2|url\()[^'"]+\2/gi,
        (_match, property, quote) => `${property}=${quote}currentColor${quote}`
      )
      .replace(
        /\b(fill|stroke)\s*:\s*(?!none(?:[;"']|$)|currentColor(?:[;"']|$)|url\()[^;"']+/gi,
        (_match, property) => `${property}:currentColor`
      );

    if (!svg.includes('currentColor')) {
      svg = svg.replace(/<svg\b/, '<svg color="currentColor"');
    }
  }

  return `${svg.replace(/>\s+</g, '><')}\n`;
}

function getDimensions(svg) {
  const match = svg.match(/\bviewBox=(['"])([^'"]+)\1/i);
  const values =
    match?.[2]
      .trim()
      .split(/[\s,]+/)
      .map(Number) ?? [];
  if (
    values.length !== 4 ||
    values.some((value) => !Number.isFinite(value)) ||
    values[2] <= 0 ||
    values[3] <= 0
  ) {
    throw new Error('SVG viewBox must contain four finite values with positive dimensions');
  }
  return { width: values[2], height: values[3] };
}

function validateInventory(inventory, exceptions) {
  const errors = [];
  if (!inventory || typeof inventory !== 'object' || Array.isArray(inventory)) {
    return ['inventory.json must contain an object'];
  }

  const rootFields = Object.keys(inventory).sort();
  if (rootFields.join(',') !== 'generatedFrom,icons') {
    errors.push('inventory.json may contain only generatedFrom and icons');
  }
  if (!inventory.generatedFrom || typeof inventory.generatedFrom !== 'object') {
    errors.push('inventory.json must include generatedFrom provenance');
  }
  if (!Array.isArray(inventory.icons)) {
    return [...errors, 'inventory.json icons must be an array'];
  }

  const ids = new Set();
  const assetPaths = new Set();
  for (const [index, icon] of inventory.icons.entries()) {
    const prefix = `icons[${index}]`;
    const fields = icon && typeof icon === 'object' ? Object.keys(icon).sort() : [];
    if (fields.join(',') !== [...iconFields].sort().join(',')) {
      errors.push(`${prefix} must contain exactly ${iconFields.join(', ')}`);
      continue;
    }
    if (!categories.has(icon.category)) errors.push(`${prefix}.category is invalid`);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(icon.name)) {
      errors.push(`${prefix}.name must be kebab-case`);
    }
    if (icon.group && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(icon.group)) {
      errors.push(`${prefix}.group must be empty or kebab-case`);
    }
    const expectedId =
      icon.category === 'pictoral' && !icon.group
        ? `${icon.category}/${icon.name}`
        : `${icon.category}/${icon.group}/${icon.name}`;
    if (icon.id !== expectedId) errors.push(`${prefix}.id must be ${expectedId}`);
    if (icon.sourceCategory !== sourceCategories[icon.category]) {
      errors.push(`${prefix}.sourceCategory does not match ${icon.category}`);
    }
    const expectedAssetPath =
      icon.category === 'interface' ? `/icons/interface/${icon.name}.svg` : `/icons/${icon.id}.svg`;
    if (icon.assetPath !== expectedAssetPath) {
      errors.push(`${prefix}.assetPath must be ${expectedAssetPath}`);
    }
    if (ids.has(icon.id)) errors.push(`Duplicate icon id: ${icon.id}`);
    if (assetPaths.has(icon.assetPath)) errors.push(`Duplicate assetPath: ${icon.assetPath}`);
    ids.add(icon.id);
    assetPaths.add(icon.assetPath);
  }

  for (const [id, reason] of Object.entries(exceptions)) {
    if (!ids.has(id)) errors.push(`Unknown icon asset exception: ${id}`);
    if (typeof reason !== 'string' || !reason.trim()) {
      errors.push(`Icon asset exception must explain why ${id} is unavailable`);
    }
  }
  return errors;
}

function generateTypeScript(icons, dimensionsById) {
  const rows = icons.map((icon) => {
    const dimensions = dimensionsById.get(icon.id) ?? defaultDimensions;
    const colorMode = resolveColorMode(icon);
    return [
      icon.id,
      icon.name,
      icon.category,
      icon.group,
      icon.sourceCategory,
      icon.assetPath,
      dimensions.width,
      dimensions.height,
      colorMode,
    ];
  });

  return [
    '// Generated by npm run icons:build from design-tokens/icons/inventory.json.',
    '// Do not edit this file by hand.',
    'export const iconData = [',
    ...rows.map((row) => `  ${JSON.stringify(row)},`),
    '] as const;',
    '',
  ].join('\n');
}

async function run() {
  const inventory = await readJson(inventoryPath);
  const exceptions = await readJson(exceptionsPath);
  const errors = validateInventory(inventory, exceptions);
  if (!Array.isArray(inventory.icons)) return { errors };

  const expectedByPath = new Map(
    inventory.icons.map((icon) => [
      path.join(iconsRoot, icon.assetPath.slice('/icons/'.length)),
      icon,
    ])
  );

  const actualFiles = await listSvgFiles(iconsRoot);
  const missing = [...expectedByPath.keys()].filter((file) => !actualFiles.includes(file));
  const requiredMissing = missing.filter((file) => !exceptions[expectedByPath.get(file)?.id]);
  const quarantinedMissing = missing.filter((file) => exceptions[expectedByPath.get(file)?.id]);
  const unexpected = actualFiles.filter((file) => !expectedByPath.has(file));

  for (const file of requiredMissing) {
    errors.push(`Required SVG is missing: ${path.relative(ROOT, file)}`);
  }
  for (const file of unexpected) {
    errors.push(`Unexpected SVG is not in inventory: ${path.relative(ROOT, file)}`);
  }

  const sanitizedByPath = new Map();
  const dimensionsById = new Map();
  const svgDrift = [];
  for (const file of actualFiles) {
    const icon = expectedByPath.get(file);
    if (!icon) continue;
    const relativePath = path.relative(iconsRoot, file).split(path.sep).join('/');
    if (!/^[a-z0-9/-]+\.svg$/.test(relativePath)) {
      errors.push(`Invalid icon filename: ${relativePath}`);
      continue;
    }
    try {
      const source = await readFile(file, 'utf8');
      const colorMode = resolveColorMode(icon);
      const sanitized = sanitizeSvg(source, colorMode);
      sanitizedByPath.set(file, sanitized);
      dimensionsById.set(icon.id, getDimensions(sanitized));
      if (source !== sanitized) svgDrift.push(file);
    } catch (error) {
      errors.push(`${relativePath}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  const generated = generateTypeScript(inventory.icons, dimensionsById);
  const currentGenerated = existsSync(generatedPath) ? await readFile(generatedPath, 'utf8') : '';
  const normalizeLineEndings = (value) => value.replace(/\r\n?/g, '\n');
  const generatedIsStale =
    normalizeLineEndings(currentGenerated) !== normalizeLineEndings(generated);

  if (check) {
    for (const file of svgDrift) {
      errors.push(`SVG requires sanitization: ${path.relative(iconsRoot, file)}`);
    }
    if (generatedIsStale) errors.push(`generated TypeScript is stale: ${generatedPath}`);
  }

  if (errors.length) return { errors };

  if (!check) {
    for (const file of svgDrift) await writeFile(file, sanitizedByPath.get(file), 'utf8');
    await mkdir(path.dirname(generatedPath), { recursive: true });
    await writeFile(generatedPath, generated, 'utf8');
  }

  return {
    errors: [],
    iconCount: inventory.icons.length,
    svgCount: actualFiles.length,
    sanitizedCount: svgDrift.length,
    quarantinedCount: quarantinedMissing.length,
  };
}

try {
  const result = await run();
  if (result.errors.length) {
    for (const error of result.errors) console.error(`Icon workflow: ${error}`);
    process.exitCode = 1;
  } else if (check) {
    console.log(
      `Icon check passed: ${result.iconCount} inventory entries, ${result.svgCount} SVGs, ` +
        `${result.quarantinedCount} quarantined.`
    );
  } else {
    console.log(
      `Built ${result.iconCount} icons; validated ${result.svgCount} SVGs; ` +
        `sanitized ${result.sanitizedCount}; ${result.quarantinedCount} quarantined.`
    );
  }
} catch (error) {
  console.error(`Icon workflow failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
