'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Accordion } from '@/design-system/ui/accordion';

interface AccordionRootProps {
  anchors: string[];
  isEditing: boolean;
  className?: string;
  children: ReactNode;
}

const hashAnchor = () => decodeURIComponent(window.location.hash.slice(1));

/**
 * Keeps one item open at a time and opens the item a `#anchor` deep link names. The items render
 * on the server; only the open state lives here.
 */
export function AccordionRoot({ anchors, isEditing, className, children }: AccordionRootProps) {
  const [value, setValue] = useState<string[]>([]);

  useEffect(() => {
    if (isEditing) return;

    const openFromHash = () => {
      const anchor = hashAnchor();
      if (!anchors.includes(anchor)) return;

      setValue([anchor]);
      // Wait for the previously open item to collapse so the target lands at the top.
      requestAnimationFrame(() => document.getElementById(anchor)?.scrollIntoView());
    };

    openFromHash();
    window.addEventListener('hashchange', openFromHash);
    return () => window.removeEventListener('hashchange', openFromHash);
  }, [anchors, isEditing]);

  return (
    <Accordion
      className={className}
      multiple={isEditing}
      // Page Builder pins every answer open, so clicking a question to edit it never collapses it.
      value={isEditing ? anchors : value}
      onValueChange={setValue}
    >
      {children}
    </Accordion>
  );
}
