import type { HTMLAttributes, ReactNode } from 'react';

type Tone = 'info' | 'success' | 'warning' | 'error';

export type AlertProps = HTMLAttributes<HTMLDivElement> & {
  tone?: Tone;
  title?: string;
  children: ReactNode;
};

export function Alert({
  tone = 'info',
  title,
  className = '',
  children,
  ...rest
}: AlertProps) {
  return (
    <div
      role="alert"
      className={['ui-alert', `ui-alert--${tone}`, className].filter(Boolean).join(' ')}
      {...rest}
    >
      <div>
        {title ? <strong>{title}</strong> : null}
        <div>{children}</div>
      </div>
    </div>
  );
}
