import type { CSSProperties } from 'react';
import { BIND_STEPS, type BindStep } from '../bindColumns.types';

export type BindStepperProps = {
  step: Exclude<BindStep, 'success'>;
};

export function BindStepper({ step }: BindStepperProps) {
  const index = BIND_STEPS.findIndex((s) => s.id === step);
  const last = BIND_STEPS.length - 1;
  const progressPct = last > 0 ? (Math.max(0, index) / last) * 100 : 0;

  return (
    <div className="bind-stepper" aria-label="Bind columns steps">
      <div
        className="bind-stepper-rail"
        style={
          {
            '--bind-step-count': String(BIND_STEPS.length),
            '--bind-progress': `${progressPct}%`,
          } as CSSProperties
        }
      >
        <div className="bind-stepper-track" aria-hidden="true" />
        <div className="bind-stepper-progress" aria-hidden="true" />
        {BIND_STEPS.map((s, i) => {
          const state = i < index ? 'done' : i === index ? 'active' : '';
          const edge = i === 0 ? ' is-first' : i === last ? ' is-last' : '';
          return (
            <div
              key={s.id}
              className={`bind-step${state ? ` ${state}` : ''}${edge}`}
              style={{ '--bind-i': String(i) } as CSSProperties}
            >
              <div className="bind-step-dot" aria-hidden="true">
                {i < index ? '✓' : i + 1}
              </div>
              <div className="bind-step-lbl">{s.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
