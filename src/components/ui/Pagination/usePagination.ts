import { useEffect, useState } from 'react';

export type UsePaginationResult<T> = {
  page: number;
  setPage: (page: number) => void;
  pageCount: number;
  pageItems: T[];
};

/**
 * Client-side pagination over an already-filtered/sorted array. Resets to
 * page 1 whenever `resetKey` changes (pass whatever identifies "a different
 * list" for this consumer — a filter string, a persona id, a tab name).
 * Clamps the current page down if the item count shrinks below it (e.g. a
 * filter narrows the results while sitting on page 3).
 */
export function usePagination<T>(
  items: T[],
  pageSize: number,
  resetKey?: unknown,
): UsePaginationResult<T> {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
    // Only reset when the caller's reset key changes, not on every item change
    // (e.g. a live-updating list shouldn't yank the user back to page 1).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const clampedPage = Math.min(page, pageCount);
  const start = (clampedPage - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);

  return { page: clampedPage, setPage, pageCount, pageItems };
}
