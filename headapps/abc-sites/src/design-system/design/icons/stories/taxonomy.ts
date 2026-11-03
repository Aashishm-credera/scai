import type { IconCategory } from '../types';

export const iconCategoryLabels: Readonly<Record<IconCategory, string>> = {
  miscellaneous: 'Miscellaneous',
  pictoral: 'Pictoral',
  interface: 'Interface',
};

/** Labels and order mirror the headings in the approved Figma icon library. */
export const iconGroupLabels: Readonly<Record<string, string>> = {
  flags: 'Flags',
  payment: 'Payment',
  integrations: 'Integrations',
  social: 'Social',
  strokes: 'Strokes',
  arrows: 'Arrows',
  charts: 'Charts',
  communication: 'Communication',
  users: 'Users',
  layout: 'Layout',
  'alerts-feedback': 'Alerts & feedback',
  shapes: 'Shapes',
  'media-devices': 'Media & devices',
  files: 'Files',
  images: 'Images',
  time: 'Time',
  education: 'Education',
  general: 'General',
  'finance-commerce': 'Finance & eCommerce',
  'maps-travel': 'Maps & travel',
  security: 'Security',
  editor: 'Editor',
};

export const iconGroupOrder: Readonly<Record<IconCategory, readonly string[]>> = {
  miscellaneous: ['flags', 'payment', 'integrations', 'social'],
  pictoral: ['strokes'],
  interface: [
    'arrows',
    'charts',
    'communication',
    'users',
    'layout',
    'alerts-feedback',
    'shapes',
    'media-devices',
    'files',
    'images',
    'time',
    'education',
    'general',
    'finance-commerce',
    'maps-travel',
    'security',
    'editor',
  ],
};
