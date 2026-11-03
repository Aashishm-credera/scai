#!/usr/bin/env node

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { TOKEN_SOURCE } from '../token.config.mjs';
import { formatValidationErrors, validateTokenFile } from './validate.mjs';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDirectory, '../..');
const input = path.resolve(root, process.argv[2] ?? TOKEN_SOURCE);
const result = validateTokenFile(input);

if (result.errors.length) {
  console.error(
    `Design-token validation failed: ${result.errors.length} error(s) in ${path.relative(root, input)}\n`
  );
  console.error(formatValidationErrors(result.errors));
  process.exit(1);
}

console.log(`Design-token validation passed: ${path.relative(root, input)}`);
