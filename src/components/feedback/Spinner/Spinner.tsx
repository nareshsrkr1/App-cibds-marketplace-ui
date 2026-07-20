import type { CSSProperties } from 'react';

export type SpinnerSize = 'sm' | 'md' | 'lg';

export type SpinnerProps = {
  size?: SpinnerSize;
  label?: string;
  className?: string;
};

/** Theme spinner: blue + gold arcs (page palette). */
const SIZE_PX: Record<SpinnerSize, number> = { sm: 28, md: 48, lg: 64 };

export function Spinner({
  size = 'lg',
  label = 'Loading',
  className = '',
}: SpinnerProps) {
  const px = SIZE_PX[size];
  const style = {
    '--spinner-size': `${px}px`,
  } as CSSProperties;

  return (
    <span
      className={`ui-spinner ui-spinner--${size}${className ? ` ${className}` : ''}`}
      style={style}
      role="status"
      aria-label={label}
    >
      <span className="ui-spinner__track" aria-hidden="true" />
      <span className="ui-spinner__arc ui-spinner__arc--blue" aria-hidden="true" />
      <span className="ui-spinner__arc ui-spinner__arc--gold" aria-hidden="true" />
    </span>
  );
}
