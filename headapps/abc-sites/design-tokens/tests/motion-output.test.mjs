import assert from 'node:assert/strict';
import test from 'node:test';
import { formatMotionValue } from '../scripts/motion-output.mjs';

test('emits the Figma cubic Bézier as valid CSS and reduced motion as linear', () => {
  assert.equal(
    formatMotionValue({ type: 'cubicBezier', resolved: [0.2, 0.8, 0.3, 1] }),
    'cubic-bezier(0.2, 0.8, 0.3, 1)'
  );
  assert.equal(formatMotionValue({ type: 'cubicBezier', resolved: [0, 0, 1, 1] }), 'linear');
  assert.equal(formatMotionValue({ type: 'duration', resolved: '90ms' }), '90ms');
  assert.equal(formatMotionValue({ type: 'duration', resolved: '0ms' }), '0ms');
});
