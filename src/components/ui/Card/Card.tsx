import type { HTMLAttributes, ReactNode } from 'react';

export type CardProps = HTMLAttributes<HTMLDivElement> & { children: ReactNode };

export function Card({ className = '', children, ...rest }: CardProps) {
  return (
    <div className={['ui-card', className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </div>
  );
}
