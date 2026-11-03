import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Accordion, type AccordionItemData } from '@/design-system/molecules/Accordion';

const items: AccordionItemData[] = [
  {
    anchor: 'free-trial',
    question: { value: 'Is there a free trial available?' },
    answer: { value: '<p>Yes. Read the <a href="/heart-health">guide</a>.</p>' },
  },
  {
    anchor: 'change-plan',
    question: { value: 'Can I change my plan later?' },
    answer: { value: '<p>Any time.</p>' },
  },
];

const render = (props: Partial<Parameters<typeof Accordion>[0]> = {}) =>
  renderToStaticMarkup(<Accordion title={{ value: 'Billing' }} items={items} {...props} />);

describe('Accordion', () => {
  it('renders the title as h3 and the questions as h4 buttons', () => {
    const html = render();

    expect(html).toMatch(/<h3[^>]*>Billing<\/h3>/);
    expect(html.match(/<h4/g)).toHaveLength(2);
    expect(html).toMatch(/<h4[^>]*><button[^>]*>.*Is there a free trial available\?/);
  });

  it('makes the questions h3 when there is no title', () => {
    const html = render({ title: undefined });

    expect(html).not.toContain('<h4');
    expect(html.match(/<h3/g)).toHaveLength(2);
  });

  it('starts closed with each button wired to its answer region', () => {
    const html = render();
    const buttons = [...html.matchAll(/<button([^>]*)>/g)].map(([, attributes]) => attributes);
    const panels = [...html.matchAll(/<div([^>]*role="region"[^>]*)>/g)].map(([, a]) => a);

    expect(buttons).toHaveLength(2);
    expect(panels).toHaveLength(2);
    buttons.forEach((button, index) => {
      expect(button).toContain('aria-expanded="false"');
      const controls = button.match(/aria-controls="([^"]+)"/)?.[1];
      const buttonId = button.match(/\sid="([^"]+)"/)?.[1];
      expect(panels[index]).toContain(`id="${controls}"`);
      expect(panels[index]).toContain(`aria-labelledby="${buttonId}"`);
    });
  });

  it('keeps closed answers in the DOM but hidden, so their links are not focusable', () => {
    const html = render();

    // Base UI upgrades `hidden` to `hidden="until-found"` after hydration.
    expect(html).toContain('href="/heart-health"');
    expect(html.match(/<div[^>]*\shidden=""[^>]*role="region"/g)).toHaveLength(2);
  });

  it('uses the anchor as the item id for deep links', () => {
    const html = render();

    expect(html).toContain('id="free-trial"');
    expect(html).toContain('id="change-plan"');
  });

  it('hides the plus and minus icons from assistive technology', () => {
    const html = render();

    expect(html).toContain('data-abc-icon="interface/general/plus"');
    expect(html).toContain('data-abc-icon="interface/general/minus"');
    expect(html).not.toMatch(/data-abc-icon="interface\/general\/(?:plus|minus)"[^>]*role="img"/);
  });

  it('opens every item in Page Builder so answers can be edited', () => {
    const html = render({ isEditing: true });

    expect(html.match(/aria-expanded="true"/g)).toHaveLength(2);
    expect(html).not.toMatch(/\shidden=/);
  });

  it('renders nothing on the published page without items', () => {
    expect(render({ items: [] })).toBe('');
  });

  it('wraps long questions instead of truncating them', () => {
    const html = render();

    expect(html).toContain('wrap-anywhere');
    expect(html).not.toMatch(/\b(?:truncate|line-clamp-\d+)\b/);
  });
});
