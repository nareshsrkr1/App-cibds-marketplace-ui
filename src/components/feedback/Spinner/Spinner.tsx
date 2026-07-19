import type { CSSProperties } from 'react';

export type SpinnerSize = 'sm' | 'md' | 'lg';

export type SpinnerProps = {
  size?: SpinnerSize;
  label?: string;
  className?: string;
};

const SIZE_PX: Record<SpinnerSize, number> = { sm: 16, md: 28, lg: 40 };

export function Spinner({
  size = 'md',
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
      <span className="ui-spinner__ring" aria-hidden="true" />
    </span>
  );
}
