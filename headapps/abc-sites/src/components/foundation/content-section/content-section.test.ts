import type { ComponentRendering } from '@sitecore-content-sdk/nextjs';
import { describe, expect, it } from 'vitest';
import { getContentSectionNumber } from './content-section';

const section = (uid: string, heading: string): ComponentRendering => ({
  componentName: 'ContentSection',
  uid,
  fields: { Heading: { value: heading } },
});

describe('getContentSectionNumber', () => {
  it('numbers titled sections in order, skipping empty headings and other components', () => {
    const placeholders = {
      content: [
        section('first', 'Overview'),
        { componentName: 'CalloutBox', uid: 'callout' },
        section('empty', '<p> </p>'),
        section('second', 'Testing'),
      ],
    };

    expect(getContentSectionNumber(placeholders, 'first')).toBe(1);
    expect(getContentSectionNumber(placeholders, 'second')).toBe(2);
    expect(getContentSectionNumber(placeholders, 'empty')).toBeUndefined();
  });

  it('finds nested sections and starts numbering within each placeholder', () => {
    const placeholders = {
      main: [
        {
          componentName: 'InPageSidebarNavigation',
          placeholders: {
            guide: [section('overview', 'Overview'), section('testing', 'Testing')],
            other: [section('other', 'Another guide')],
          },
        },
      ],
    };

    expect(getContentSectionNumber(placeholders, 'testing')).toBe(2);
    expect(getContentSectionNumber(placeholders, 'other')).toBe(1);
  });

  it('supports GraphQL datasource fields', () => {
    const placeholders = {
      content: [
        {
          componentName: 'ContentSection',
          uid: 'graphql',
          fields: { data: { datasource: { Heading: { jsonValue: { value: 'Overview' } } } } },
        },
      ],
    } as unknown as ComponentRendering['placeholders'];

    expect(getContentSectionNumber(placeholders, 'graphql')).toBe(1);
  });

  it('returns no number when layout data or the rendering uid is missing', () => {
    expect(getContentSectionNumber(undefined, 'missing')).toBeUndefined();
    expect(
      getContentSectionNumber({ content: [section('first', 'Overview')] }, undefined)
    ).toBeUndefined();
    expect(getContentSectionNumber({ content: [] }, 'missing')).toBeUndefined();
  });
});
