import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { APP_REGISTRY } from './register/registry';
import { resolveMintIds } from './register/mintDatasetId';
import {
  REG_STEPS,
  createInitialRegisterState,
  type RegisterFormState,
} from './register/types';
import { DescribeStep } from './register/DescribeStep';
import { ContextStep } from './register/ContextStep';
import { PhysicalStep } from './register/PhysicalStep';
import { RestrictStep } from './register/RestrictStep';
import { StewardshipStep } from './register/StewardshipStep';
import { TechnicalStep } from './register/TechnicalStep';
import { ScheduleStep } from './register/ScheduleStep';
import { ReviewStep } from './register/ReviewStep';
import './register.css';

type Props = {
  open?: boolean;
  onClose?: () => void;
};

export function RegisterPhysicalDatasetWizard({ open = true, onClose }: Props) {
  const navigate = useNavigate();
  const [state, setState] = useState<RegisterFormState>(() => createInitialRegisterState());

  const stepId = REG_STEPS[state.step]?.id ?? 'describe';
  const canContinueDescribe = Boolean(state.app && state.name);
  const canMint = canContinueDescribe;

  const onChange = <K extends keyof RegisterFormState>(key: K, value: RegisterFormState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const onToggleUseCase = (useCase: string) => {
    setState((prev) => {
      const exists = prev.useCases.includes(useCase);
      return {
        ...prev,
        useCases: exists
          ? prev.useCases.filter((u) => u !== useCase)
          : [...prev.useCases, useCase],
      };
    });
  };

  const close = () => {
    if (onClose) onClose();
    else navigate('/workspace');
  };

  const next = () => {
    if (state.step >= REG_STEPS.length - 1) return;
    if (stepId === 'describe' && !canContinueDescribe) return;
    setState((prev) => ({ ...prev, step: prev.step + 1 }));
  };

  const back = () => {
    if (state.step <= 0) return;
    setState((prev) => ({ ...prev, step: prev.step - 1 }));
  };

  const jump = (index: number) => {
    if (index <= state.step) setState((prev) => ({ ...prev, step: index }));
  };

  const mint = () => {
    const ids = resolveMintIds(state.app, APP_REGISTRY);
    if (!ids) return;
    setState((prev) => ({
      ...prev,
      ...ids,
      minted: true,
    }));
  };

  const bindColumns = () => {
    navigate('/workspace/bind-columns');
  };

  const body = useMemo(() => {
    switch (stepId) {
      case 'describe':
        return <DescribeStep state={state} onChange={onChange} />;
      case 'context':
        return (
          <ContextStep state={state} onChange={onChange} onToggleUseCase={onToggleUseCase} />
        );
      case 'physical':
        return <PhysicalStep state={state} onChange={onChange} />;
      case 'restrict':
        return <RestrictStep state={state} onChange={onChange} />;
      case 'steward':
        return <StewardshipStep state={state} onChange={onChange} />;
      case 'tech':
        return <TechnicalStep state={state} onChange={onChange} />;
      case 'schedule':
        return <ScheduleStep state={state} onChange={onChange} />;
      case 'review':
        return <ReviewStep state={state} />;
      default:
        return null;
    }
  }, [stepId, state]);

  if (!open) return null;

  return (
    <div className="modal-bg rg-modal-bg" role="dialog" aria-modal="true" aria-labelledby="rg-title">
      <div className="modal wide rg-modal">
        <div className="mhead">
          <div>
            <div className="eyebrow">Producer · Registration</div>
            <h3 id="rg-title">Register a physical dataset</h3>
          </div>
          <button type="button" className="x" aria-label="Close" onClick={close}>
            ×
          </button>
        </div>

        <div className="reg-body" id="reg-body">
          {!state.minted ? (
            <div className="rg-stepper" role="tablist" aria-label="Registration steps">
              {REG_STEPS.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  className={`rg-step${i === state.step ? ' active' : ''}${i < state.step ? ' done' : ''}`}
                  onClick={() => jump(i)}
                  aria-selected={i === state.step}
                >
                  <span className="rg-dot">{i < state.step ? '✓' : i + 1}</span>
                  <span className="rg-lbl">{s.label}</span>
                </button>
              ))}
            </div>
          ) : null}
          {body}
        </div>

        <div className="mfoot" id="reg-foot">
          {state.minted ? (
            <>
              <button type="button" className="btn btn-s" onClick={close}>
                Done
              </button>
              <div className="spacer" />
              <button type="button" className="btn btn-p" onClick={bindColumns}>
                Bind columns →
              </button>
            </>
          ) : stepId === 'review' ? (
            <>
              <button type="button" className="btn btn-s" onClick={back}>
                ← Back
              </button>
              <div className="spacer" />
              <button
                type="button"
                className="btn btn-p"
                disabled={!canMint}
                onClick={mint}
              >
                Register — mint Dataset ID ✓
              </button>
            </>
          ) : (
            <>
              {state.step > 0 ? (
                <button type="button" className="btn btn-s" onClick={back}>
                  ← Back
                </button>
              ) : (
                <button type="button" className="btn btn-s" onClick={close}>
                  Cancel
                </button>
              )}
              <div className="spacer" />
              <button
                type="button"
                className="btn btn-p"
                disabled={stepId === 'describe' && !canContinueDescribe}
                onClick={next}
              >
                Continue →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
