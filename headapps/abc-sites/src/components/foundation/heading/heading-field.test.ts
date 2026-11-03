import { describe, expect, it } from 'vitest';
import { sanitizeHeadingHtml } from './heading-field';

describe('heading field server helpers', () => {
  it('sanitizes markup to plain text with only superscript and subscript markup', () => {
    expect(sanitizeHeadingHtml('A <strong>bold</strong> <sup>™</sup><sub>2</sub>')).toBe(
      'A bold <sup>™</sup><sub>2</sub>'
    );
  });
});
