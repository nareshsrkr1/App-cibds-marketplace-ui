import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { usePagination } from './usePagination';

describe('usePagination', () => {
  it('slices items into pages of the given size', () => {
    const items = Array.from({ length: 25 }, (_, i) => i);
    const { result } = renderHook(() => usePagination(items, 10));

    expect(result.current.page).toBe(1);
    expect(result.current.pageCount).toBe(3);
    expect(result.current.pageItems).toEqual(items.slice(0, 10));

    act(() => result.current.setPage(3));
    expect(result.current.pageItems).toEqual(items.slice(20, 25));
  });

  it('does not paginate when everything fits on one page', () => {
    const items = [1, 2, 3];
    const { result } = renderHook(() => usePagination(items, 10));

    expect(result.current.pageCount).toBe(1);
    expect(result.current.pageItems).toEqual(items);
  });

  it('clamps the current page down when the item count shrinks', () => {
    const { result, rerender } = renderHook(({ items }) => usePagination(items, 10), {
      initialProps: { items: Array.from({ length: 25 }, (_, i) => i) },
    });

    act(() => result.current.setPage(3));
    expect(result.current.page).toBe(3);

    rerender({ items: Array.from({ length: 5 }, (_, i) => i) });
    expect(result.current.page).toBe(1);
    expect(result.current.pageCount).toBe(1);
  });

  it('resets to page 1 when resetKey changes', () => {
    const items = Array.from({ length: 25 }, (_, i) => i);
    const { result, rerender } = renderHook(
      ({ resetKey }) => usePagination(items, 10, resetKey),
      { initialProps: { resetKey: 'a' } },
    );

    act(() => result.current.setPage(3));
    expect(result.current.page).toBe(3);

    rerender({ resetKey: 'b' });
    expect(result.current.page).toBe(1);
  });
});
