'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import { abcIcon } from '../abcIcon';
import { iconAssetExceptions, isIconAssetAvailable } from '../availability';
import { filterIcons, getIconGroupLabel, getIconGroups, sortIcons } from './filter-icons';
import { iconDefinitions } from '../registry';
import { iconCategoryLabels } from './taxonomy';
import { iconCategories, type IconCategory } from '../types';

const pageSize = 120;

export function IconGallery() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<IconCategory | 'all'>('all');
  const [group, setGroup] = useState<string | 'all'>('all');
  const [limit, setLimit] = useState(pageSize);
  const availableCategories = useMemo(
    () =>
      iconCategories.filter((iconCategory) =>
        iconDefinitions.some(
          (icon) => icon.category === iconCategory && isIconAssetAvailable(icon.id)
        )
      ),
    []
  );
  const deferredQuery = useDeferredValue(query);
  const availableGroups = useMemo(
    () => (category === 'all' ? [] : getIconGroups(iconDefinitions, category)),
    [category]
  );
  const filteredIcons = useMemo(
    () => sortIcons(filterIcons(iconDefinitions, deferredQuery, category, group)),
    [category, deferredQuery, group]
  );
  const visibleIcons = filteredIcons.slice(0, limit);

  const updateQuery = (value: string) => {
    setQuery(value);
    setLimit(pageSize);
  };

  const updateCategory = (value: IconCategory | 'all') => {
    setCategory(value);
    setGroup('all');
    setLimit(pageSize);
  };

  const updateGroup = (value: string | 'all') => {
    setGroup(value);
    setLimit(pageSize);
  };

  return (
    <main className="mx-auto grid max-w-7xl gap-6 p-4 text-foreground sm:p-6">
      <header className="grid gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">abc icons</h1>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_12rem_12rem]">
        <label className="grid gap-1 text-sm font-medium">
          Search
          <input
            type="search"
            value={query}
            onChange={(event) => updateQuery(event.target.value)}
            placeholder="Icon name"
            className="h-10 rounded-md border bg-background px-3 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>

        <label className="grid gap-1 text-sm font-medium">
          Category
          <select
            value={category}
            onChange={(event) => updateCategory(event.target.value as IconCategory | 'all')}
            className="h-10 rounded-md border bg-background px-3 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">All</option>
            {availableCategories.map((value) => (
              <option key={value} value={value}>
                {iconCategoryLabels[value]}
              </option>
            ))}
          </select>
        </label>

        {availableGroups.length > 0 && (
          <label className="grid gap-1 text-sm font-medium">
            Subcategory
            <select
              value={group}
              onChange={(event) => updateGroup(event.target.value)}
              className="h-10 rounded-md border bg-background px-3 outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">All</option>
              {availableGroups.map((value) => (
                <option key={value} value={value}>
                  {getIconGroupLabel(value)}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <p aria-live="polite" className="text-sm text-muted-foreground">
        Showing {visibleIcons.length.toLocaleString()} of {filteredIcons.length.toLocaleString()}
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {visibleIcons.map((icon) => {
          const available = isIconAssetAvailable(icon.id);
          return (
            <article key={icon.id} className="grid min-w-0 gap-3 rounded-lg border bg-card p-3">
              <div className="flex h-24 items-center justify-center rounded-md bg-muted/60">
                <abcIcon name={icon.id} size="xl" aria-hidden />
              </div>
              <div className="min-w-0">
                <code className="block break-all text-xs text-muted-foreground" title={icon.id}>
                  {icon.id}
                </code>
                {!available && (
                  <p className="text-xs text-destructive" title={iconAssetExceptions[icon.id]}>
                    SVG quarantined
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {visibleIcons.length < filteredIcons.length && (
        <button
          type="button"
          onClick={() => setLimit((current) => current + pageSize)}
          className="mx-auto rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Show more
        </button>
      )}

      {filteredIcons.length === 0 && (
        <p className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          No icons found.
        </p>
      )}
    </main>
  );
}
