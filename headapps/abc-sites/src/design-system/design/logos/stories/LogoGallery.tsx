'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import { abcLogo } from '../abcLogo';
import { filterLogos, sortLogos } from './filter-logos';
import { logoDefinitions } from '../registry';
import { logoCategories, type LogoCategory } from '../types';

const categoryLabels: Record<LogoCategory, string> = {
  abc: 'abc',
  partner: 'Accreditation partners',
};

export function LogoGallery() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<LogoCategory | 'all'>('all');
  const deferredQuery = useDeferredValue(query);
  const filteredLogos = useMemo(
    () => sortLogos(filterLogos(logoDefinitions, deferredQuery, category)),
    [category, deferredQuery]
  );

  return (
    <main className="mx-auto grid max-w-7xl gap-6 p-4 text-foreground sm:p-6">
      <header className="grid gap-2">
        <h1 className="text-3xl font-semibold">abc logos</h1>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_12rem]">
        <label className="grid gap-1 text-sm font-medium">
          Search
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Logo name"
            className="h-10 rounded-md border bg-background px-3 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>

        <label className="grid gap-1 text-sm font-medium">
          Category
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value as LogoCategory | 'all')}
            className="h-10 rounded-md border bg-background px-3 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">All</option>
            {logoCategories.map((value) => (
              <option key={value} value={value}>
                {categoryLabels[value]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p aria-live="polite" className="text-sm text-muted-foreground">
        Showing {filteredLogos.length} of {logoDefinitions.length}
      </p>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(18rem,1fr))] gap-4">
        {filteredLogos.flatMap((logo) =>
          logo.variants.map((variant) => (
            <article
              key={`${logo.id}-${variant}`}
              className="grid min-w-0 gap-3 rounded-lg border bg-card p-3"
            >
              <div
                className={
                  variant === 'badge'
                    ? 'flex h-40 items-center justify-center rounded-md bg-[var(--abc-surface-brand-brand-2)] p-6'
                    : 'flex h-40 items-center justify-center rounded-md bg-[var(--abc-surface-default-secondary)] p-6'
                }
              >
                <abcLogo name={logo.id} size="lg" variant={variant} />
              </div>
              <div className="min-w-0">
                <code className="block break-all text-xs text-muted-foreground" title={logo.id}>
                  {logo.id}
                </code>
              </div>
            </article>
          ))
        )}
      </div>

      {filteredLogos.length === 0 && (
        <p className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          No logos found.
        </p>
      )}
    </main>
  );
}
