import { useEffect, useState } from 'react';
import { ConsoleHeader } from '../components/ConsoleHeader';
import { ErrorState } from '../../../components/feedback/ErrorState/ErrorState';
import { Spinner } from '../../../components/feedback/Spinner/Spinner';
import { fetchWorkflowBoard } from './workflow.api';
import type { WorkflowBoardResponse } from './workflow.types';
import './workflow.css';

export function WorkflowPage() {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [board, setBoard] = useState<WorkflowBoardResponse | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const ac = new AbortController();
    setStatus('loading');
    setError(null);
    void fetchWorkflowBoard({ signal: ac.signal })
      .then((res) => {
        if (ac.signal.aborted) return;
        if (!res.ok) {
          setStatus('error');
          setError(res.error);
          setBoard(null);
          return;
        }
        setBoard(res.data);
        setStatus('ready');
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Unable to load workflow.');
        setBoard(null);
      });
    return () => ac.abort();
  }, [reloadToken]);

  if (status === 'loading') {
    return (
      <div className="workflow-page" data-testid="workflow-page">
        <div className="workflow-loading" role="status">
          <Spinner size="lg" label="Loading workflow" />
        </div>
      </div>
    );
  }

  if (status === 'error' || !board) {
    return (
      <div className="workflow-page" data-testid="workflow-page">
        <div className="workflow-error">
          <ErrorState
            title="Unable to load workflow"
            description={error ?? 'Something went wrong.'}
            onRetry={() => setReloadToken((n) => n + 1)}
          />
        </div>
      </div>
    );
  }

  const pendingReqs = board.subscriptionRequests;
  const awaitingCount = pendingReqs.length;
  const proposed = board.proposedElements;
  const unmapped = board.unmappedColumns;

  return (
    <div className="workflow-page" data-testid="workflow-page">
      <ConsoleHeader
        eyebrow="Workspace · Workflow"
        greeting="Your in-flight work."
        subtitle="Track everything moving through the governance pipeline — what needs you, what is with governance, and what is cleared."
      />

      <div className="wf-wrap">
        <div className="wf-pipe" aria-label="Workflow pipeline">
          <div className="wf-pstage">
            <span className="wf-pn">{awaitingCount}</span>
            <span className="wf-pl">Awaiting you</span>
            <span className="wf-pd">Subscription approvals</span>
          </div>
          <div className="wf-parrow" aria-hidden="true">
            →
          </div>
          <div className="wf-pstage">
            <span className="wf-pn">{proposed.length}</span>
            <span className="wf-pl">With governance</span>
            <span className="wf-pd">Proposed elements</span>
          </div>
          <div className="wf-parrow" aria-hidden="true">
            →
          </div>
          <div className="wf-pstage">
            <span className="wf-pn">{unmapped.length}</span>
            <span className="wf-pl">Needs mapping</span>
            <span className="wf-pd">Unmapped columns</span>
          </div>
          <div className="wf-parrow" aria-hidden="true">
            →
          </div>
          <div className="wf-pstage done">
            <span className="wf-pn">{board.clearedThisWeek}</span>
            <span className="wf-pl">Cleared</span>
            <span className="wf-pd">This week</span>
          </div>
        </div>

        <section className="wf-sec" aria-labelledby="wf-awaiting">
          <div className="wf-sech">
            <div className="wf-sect" id="wf-awaiting">
              <span className="wf-dot act" aria-hidden="true" />
              Awaiting your approval
            </div>
            <span className="wf-secn">
              {awaitingCount} subscription request{awaitingCount !== 1 ? 's' : ''}
            </span>
          </div>

          {awaitingCount === 0 ? (
            <div className="wf-empty">Nothing awaiting your approval.</div>
          ) : (
            pendingReqs.map((r) => (
              <div key={r.id} className="wf-card act">
                <div className="wf-card-l">
                  <div className="wf-card-t">{r.consumer}</div>
                  <div className="wf-card-meta">
                    <span className="wf-chip">{r.dataset}</span>
                    <span className="mono wf-idchip">{r.datasetId}</span>
                  </div>
                  <div className="wf-card-req">
                    Requests access to your dataset ·{' '}
                    <span className="wf-age-in">{r.age} ago</span>
                  </div>
                </div>
                <div className="wf-card-r">
                  <div className="wf-card-acts">
                    <button
                      type="button"
                      className="wf-btn"
                      disabled
                      title="Available in a future release"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="wf-decline"
                      disabled
                      title="Available in a future release"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>

        <section className="wf-sec" aria-labelledby="wf-gov">
          <div className="wf-sech">
            <div className="wf-sect" id="wf-gov">
              <span className="wf-dot gov" aria-hidden="true" />
              With governance
            </div>
            <span className="wf-secn">
              {proposed.length} proposed element{proposed.length !== 1 ? 's' : ''}
            </span>
          </div>
          {proposed.length === 0 ? (
            <div className="wf-empty">No proposals in flight.</div>
          ) : (
            proposed.map((p) => (
              <div key={p.id} className="wf-card">
                <div className="wf-card-l">
                  <div className="wf-card-t">
                    {p.name} <span className="mono wf-idchip">{p.id}</span>
                  </div>
                  <div className="wf-card-meta">
                    <span className="wf-chip">{p.dataset}</span>
                    <span className="wf-by">by {p.by}</span>
                  </div>
                  <div className="wf-track" aria-label="Proposal track">
                    <span className="wf-tk done">Proposed</span>
                    <span className="wf-tl" aria-hidden="true" />
                    <span className="wf-tk active">In review</span>
                    <span className="wf-tl" aria-hidden="true" />
                    <span className="wf-tk">Endorsed</span>
                  </div>
                </div>
                <div className="wf-card-r">
                  <span className="wf-status gov">{p.status}</span>
                  <span className="wf-age-in">{p.age} ago</span>
                </div>
              </div>
            ))
          )}
        </section>

        <section className="wf-sec" aria-labelledby="wf-gaps">
          <div className="wf-sech">
            <div className="wf-sect" id="wf-gaps">
              <span className="wf-dot gap" aria-hidden="true" />
              Needs mapping
            </div>
            <span className="wf-secn">
              {unmapped.length} unmapped column{unmapped.length !== 1 ? 's' : ''}
            </span>
          </div>
          {unmapped.length === 0 ? (
            <div className="wf-empty">All columns mapped.</div>
          ) : (
            unmapped.map((u) => (
              <div key={u.id} className="wf-card">
                <div className="wf-card-l">
                  <div className="wf-card-t">
                    <span className="mono">{u.column}</span>{' '}
                    <span className="mono wf-idchip">{u.id}</span>
                  </div>
                  <div className="wf-card-meta">
                    <span className="wf-chip">{u.dataset}</span>
                    <span className="wf-by">by {u.by}</span>
                  </div>
                  <div className="wf-card-req">
                    No business element bound — routed to governance for a decision
                  </div>
                </div>
                <div className="wf-card-r">
                  <span className="wf-status gap">{u.status}</span>
                  <span className="wf-age-in">{u.age} ago</span>
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
