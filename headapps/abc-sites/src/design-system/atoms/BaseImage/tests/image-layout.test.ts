import { describe, expect, it } from 'vitest';

import {
  alignmentClass,
  aspectRatioClasses,
  IMAGE_ALIGNMENTS,
  IMAGE_ASPECT_RATIOS,
  isImageAspectRatio,
} from '../image-layout';

describe('image layout', () => {
  it('offers exactly the four ratios in the acceptance criteria', () => {
    expect([...IMAGE_ASPECT_RATIOS].sort()).toEqual(['16:9', '3:2', '4:5', '5:4']);
  });

  it('keeps 5:4 and 4:5 at every size, since both are allowed on mobile', () => {
    expect(aspectRatioClasses('5:4')).toBe('aspect-5/4');
    expect(aspectRatioClasses('4:5')).toBe('aspect-4/5');
  });

  it('falls back to 5:4 below 480px for the landscape ratios mobile does not allow', () => {
    expect(aspectRatioClasses('3:2')).toBe('aspect-5/4 md:aspect-3/2');
    expect(aspectRatioClasses('16:9')).toBe('aspect-5/4 md:aspect-16/9');
  });

  it('recognises only those four ratios', () => {
    expect(isImageAspectRatio(undefined)).toBe(false);
    expect(isImageAspectRatio('')).toBe(false);
    expect(isImageAspectRatio('21:9')).toBe(false);
  });

  it('offers the four Image Alignment style options', () => {
    expect([...IMAGE_ALIGNMENTS].sort()).toEqual(['center', 'full', 'left', 'right']);
  });

  it('maps each alignment to the style class authors pick in Pages', () => {
    for (const alignment of IMAGE_ALIGNMENTS) {
      expect(alignmentClass(alignment)).toBe(`image-align-${alignment}`);
    }
  });
});
