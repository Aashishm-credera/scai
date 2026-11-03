import { LinkDropdown, type LinkDropdownItem } from '@/design-system/molecules/LinkDropdown';

type PositioningExample = {
  className: string;
  items: readonly LinkDropdownItem[];
  name: string;
};

const figmaItems = [
  { id: 'heart-health', label: 'Heart health', href: '/health-topics/heart-health' },
  { id: 'healthy-living', label: 'Healthy living', href: '/healthy-living' },
] satisfies readonly LinkDropdownItem[];

const longItems = [
  {
    id: 'long',
    label:
      'A comprehensive guide to preventing cardiovascular disease throughout every stage of life',
    href: '/healthy-living/prevention',
  },
] satisfies readonly LinkDropdownItem[];

const positioningExamples: readonly PositioningExample[] = [
  { className: 'fixed top-24 left-0', items: figmaItems, name: 'Left edge links' },
  { className: 'fixed top-64 right-0', items: figmaItems, name: 'Right edge links' },
  { className: 'fixed right-8 bottom-0', items: figmaItems, name: 'Flip above links' },
  {
    className: 'fixed top-1/2 left-1/2 -translate-x-1/2',
    items: longItems,
    name: 'Long label links',
  },
];

export function LinkDropdownPositioning() {
  return (
    <main className="min-h-screen bg-(--abc-surface-default-primary)">
      {positioningExamples.map((example) => (
        <LinkDropdown
          className={example.className}
          defaultOpen
          items={example.items}
          key={example.name}
          navigationLabel={example.name}
          triggerLabel={`Open ${example.name}`}
        />
      ))}
    </main>
  );
}
