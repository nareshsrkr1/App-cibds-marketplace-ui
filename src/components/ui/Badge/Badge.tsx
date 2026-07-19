import type { HTMLAttributes, ReactNode } from 'react';

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: Tone;
  children: ReactNode;
};

export function Badge({ tone = 'neutral', className = '', children, ...rest }: BadgeProps) {
  const toneClass = tone === 'neutral' ? '' : `ui-badge--${tone}`;
  return (
    <span className={['ui-badge', toneClass, className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </span>
  );
}
