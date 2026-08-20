import type { ReactNode } from 'react';

const ICON_SIZE = 19.5;

/**
 * Presentation-only swap for the unicode glyphs stored in mock/API nav JSON
 * (`NavItem.icon`, still a plain string) — each entry mirrors the shape of the
 * glyph it replaces so the contract and mock data never need to change.
 */
const GLYPHS: Record<string, ReactNode> = {
  '◇': (
    <path d="M8 1.5 14 8 8 14.5 2 8Z" fill="none" stroke="currentColor" strokeWidth="1.4" />
  ),
  '■': <rect x="2.5" y="2.5" width="11" height="11" rx="2" fill="currentColor" />,
  '●': <circle cx="8" cy="8" r="5.5" fill="currentColor" />,
  '◆': (
    <path d="M8 1.5 14 8 8 14.5 2 8Z" fill="currentColor" />
  ),
  '≡': (
    <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <line x1="2.5" y1="4.5" x2="13.5" y2="4.5" />
      <line x1="2.5" y1="8" x2="13.5" y2="8" />
      <line x1="2.5" y1="11.5" x2="13.5" y2="11.5" />
    </g>
  ),
  '▤': (
    <g fill="none" stroke="currentColor" strokeWidth="1.3">
      <rect x="2.5" y="2.5" width="11" height="11" rx="1.5" />
      <line x1="2.5" y1="6" x2="13.5" y2="6" />
      <line x1="5.5" y1="6" x2="5.5" y2="13.5" />
    </g>
  ),
  '⊞': (
    <g fill="none" stroke="currentColor" strokeWidth="1.3">
      <rect x="2.5" y="2.5" width="11" height="11" rx="1.5" />
      <line x1="8" y1="2.5" x2="8" y2="13.5" />
      <line x1="2.5" y1="8" x2="13.5" y2="8" />
    </g>
  ),
  '○': <circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.4" />,
  '❖': (
    <path
      d="M8 1.5 9.6 6.4 14.5 8 9.6 9.6 8 14.5 6.4 9.6 1.5 8 6.4 6.4Z"
      fill="currentColor"
    />
  ),
  '⁘': (
    <g fill="currentColor">
      <circle cx="5.5" cy="5.5" r="1.4" />
      <circle cx="10.5" cy="5.5" r="1.4" />
      <circle cx="5.5" cy="10.5" r="1.4" />
      <circle cx="10.5" cy="10.5" r="1.4" />
    </g>
  ),
  '◐': (
    <g>
      <circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 2.5A5.5 5.5 0 0 1 8 13.5Z" fill="currentColor" />
    </g>
  ),
  '◎': (
    <g fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="8" cy="8" r="5.5" />
      <circle cx="8" cy="8" r="1.8" fill="currentColor" stroke="none" />
    </g>
  ),
  '◫': (
    <g fill="none" stroke="currentColor" strokeWidth="1.3">
      <rect x="2.5" y="2.5" width="11" height="11" rx="1.5" />
      <line x1="9.5" y1="2.5" x2="9.5" y2="13.5" />
    </g>
  ),
  '▣': (
    <g fill="none" stroke="currentColor" strokeWidth="1.3">
      <rect x="2.5" y="2.5" width="11" height="11" rx="1.5" />
      <rect x="5.2" y="5.2" width="5.6" height="5.6" rx="1" />
    </g>
  ),
  '◷': (
    <g fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="8" cy="8" r="5.5" />
      <path d="M8 4.8V8l2.6 1.6" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  ),
};

export function NavIcon({ glyph }: { glyph?: string }) {
  const path = glyph ? GLYPHS[glyph] : undefined;
  if (!path) return glyph ? <>{glyph}</> : null;
  return (
    <svg
      width={ICON_SIZE}
      height={ICON_SIZE}
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
    >
      {path}
    </svg>
  );
}
