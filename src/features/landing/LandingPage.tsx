import { Fragment, useEffect, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSessionContext, hasEntitlement } from '../session/session.api';
import { WORKSPACE_VIEW } from '../session/session.types';
import { fetchLandingContent, fetchLandingMetrics } from './landing.api';
import type {
  Capability,
  DiagramNode,
  FaqItem,
  LandingMetric,
  PipelineStep,
} from './landing.types';
import './landing.css';

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function LandingPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<LandingMetric[] | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'empty' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [diagram, setDiagram] = useState<DiagramNode[]>([]);
  const [caps, setCaps] = useState<Capability[]>([]);
  const [steps, setSteps] = useState<PipelineStep[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [contentStatus, setContentStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [workspaceState, setWorkspaceState] = useState<'loading' | 'enabled' | 'disabled'>('loading');

  // One bootstrap: three distinct APIs in parallel (not three separate mount cycles).
  // httpClient also dedupes concurrent identical GETs (React Strict Mode remount).
  useEffect(() => {
    const ac = new AbortController();
    const { signal } = ac;

    setWorkspaceState('loading');
    setStatus('loading');
    setContentStatus('loading');

    void fetchSessionContext({ signal })
      .then((res) => {
        if (signal.aborted) return;
        if (!res.ok || !hasEntitlement(res.data, WORKSPACE_VIEW)) {
          setWorkspaceState('disabled');
          return;
        }
        setWorkspaceState('enabled');
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setWorkspaceState('disabled');
      });

    void fetchLandingMetrics({ signal })
      .then((res) => {
        if (signal.aborted) return;
        if (!res.ok) {
          setStatus('error');
          setError(res.error);
          setStats(null);
          return;
        }
        if (res.data.stats.length === 0) {
          setStatus('empty');
          setStats([]);
          return;
        }
        setStats(res.data.stats);
        setStatus('ready');
        setError(null);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Unable to load metrics.');
        setStats(null);
      });

    void fetchLandingContent({ signal })
      .then((res) => {
        if (signal.aborted) return;
        if (!res.ok) {
          setContentStatus('error');
          setDiagram([]);
          setCaps([]);
          setSteps([]);
          setFaqs([]);
          return;
        }
        setDiagram(res.data.diagram ?? []);
        setCaps(res.data.capabilities ?? []);
        setSteps(res.data.pipeline ?? []);
        setFaqs(res.data.faqs ?? []);
        setContentStatus('ready');
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setContentStatus('error');
        setDiagram([]);
        setCaps([]);
        setSteps([]);
        setFaqs([]);
      });

    return () => {
      ac.abort();
    };
  }, []);

  return (
    <div id="home">
      <nav className="pl-nav" aria-label="Primary">
        <div className="pl-brand">
          <div className="b1">CIB Data Services</div>
          <div className="b2">Data Marketplace</div>
        </div>
        <div className="pl-navlinks">
          <a href="#pl-cap" onClick={(e) => { e.preventDefault(); scrollToId('pl-cap'); }}>Capabilities</a>
          <a href="#pl-how" onClick={(e) => { e.preventDefault(); scrollToId('pl-how'); }}>How it works</a>
          <a href="#pl-faq" onClick={(e) => { e.preventDefault(); scrollToId('pl-faq'); }}>FAQ</a>
        </div>
        <div className="pl-navr">
          <button type="button" className="btn-ghost" disabled title="Catalogue is out of scope for this delivery">Browse catalogue</button>
          <button
            type="button"
            className="btn-dk pl-nav-cta"
            disabled={workspaceState !== 'enabled'}
            title={
              workspaceState === 'loading'
                ? 'Loading workspace access…'
                : workspaceState === 'enabled'
                  ? 'Open workspace'
                  : 'Workspace is unavailable for your account'
            }
            onClick={() => navigate('/workspace')}
          >
            Open workspace →
          </button>
        </div>
      </nav>

      <section className="pl-hero">
        <div className="pl-hero-in">
          <div className="pl-hero-l">
            <div className="pl-eyebrow">Wells Fargo · Corporate &amp; Investment Banking</div>
            <h1>
              Data that
              <br />
              {' '}
              moves the
              <br />
              {' '}
              <em>firm forward.</em>
            </h1>
            <p className="pl-hero-p">The single governed marketplace for the firm's data. Teams publish the data they own; it’s checked and classified; and anyone across the firm can find it, understand it, and get access under clear terms — with full traceability from source to consumer.</p>
            <div className="pl-hero-actions">
              <button
                type="button"
                className="btn-dk btn-lg"
                disabled={workspaceState !== 'enabled'}
                title={
                  workspaceState === 'loading'
                    ? 'Loading workspace access…'
                    : workspaceState === 'enabled'
                      ? 'Open workspace'
                      : 'Workspace is unavailable for your account'
                }
                onClick={() => navigate('/workspace')}
              >
                Open workspace →
              </button>
              <button type="button" className="btn-lt btn-lg" disabled title="Catalogue is out of scope for this delivery">Browse the catalogue</button>
            </div>
          </div>
          <div className="pl-hero-r">
            <div className="pl-diagram">
              <div className="pl-dg-h">How data moves</div>
              {contentStatus === 'ready' && diagram.length > 0 ? (
                <div className="pl-dg-flow">
                  {diagram.map((node) => (
                    <Fragment key={node.id}>
                      <div className={`pl-dg-node ${node.kind}`}>
                        <span className="pl-dg-k">{node.k}</span>
                        <span className="pl-dg-id">{node.id}</span>
                        <span className="pl-dg-d">{node.d}</span>
                      </div>
                      {node.connLabel ? (
                        <div className={`pl-dg-conn${node.thinConn ? ' thin' : ''}`}>
                          <span className="pl-dg-lbl">{node.connLabel}</span>
                        </div>
                      ) : null}
                    </Fragment>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {status === 'error' && (
        <div className="state-banner error" role="alert">{error ?? 'Unable to load metrics.'}</div>
      )}
      {status === 'empty' && (
        <div className="state-banner empty">No marketplace metrics available yet.</div>
      )}

      {status === 'ready' && stats ? (
        <div className="pl-proof">
          <div className="pl-proof-in">
            {stats.map((s) => (
              <div className="pl-pf" key={s.key}>
                <span className="pl-pf-v">{s.value}</span>
                <span className="pl-pf-l">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <section className="pl-section" id="pl-cap">
        <div className="pl-sec-in">
          <div className="pl-sec-eyebrow">Platform capabilities</div>
          <h2 className="pl-sec-h">Six reasons data moves with confidence.</h2>
          <p className="pl-sec-lead">The Data Marketplace is not a filing system. It is the infrastructure that turns raw data into a firm asset &mdash; discoverable, trusted, and ready to use.</p>
          {contentStatus === 'ready' && caps.length > 0 ? (
            <div className="pl-caps">
              {caps.map((c) => (
                <div className={`pl-cap${c.ai ? ' pl-cap-ai' : ''}`} key={c.n}>
                  <div className="pl-cap-n">
                    {c.n}{c.aiTag ? <span className="pl-cap-ai-tag">{c.aiTag}</span> : null}
                  </div>
                  <div className="pl-cap-h">{c.title}</div>
                  <p>{c.body}</p>
                  <div className="pl-cap-tags">{c.tags.map((t) => <span key={t}>{t}</span>)}</div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="pl-section pl-how" id="pl-how">
        <div className="pl-sec-in">
          <div className="pl-sec-eyebrow">How it works</div>
          <h2 className="pl-sec-h">From one team to another — safely, and traceably.</h2>
          <p className="pl-sec-lead">Every dataset follows the same simple path — with meaning and traceability captured at every step. Underneath, a shared ontology and context fabric link it all together, so the marketplace can explain any dataset in plain language while people stay in control of every decision.</p>
          {contentStatus === 'ready' && steps.length > 0 ? (
            <div
              className="pl-pipeline"
              style={{ '--pl-steps': steps.length } as CSSProperties}
            >
              {steps.map((s) => (
                <div className="pl-pstep" key={s.n}>
                  <div className="pl-pdot">{s.n}</div>
                  <div className="pl-ph">{s.title}</div>
                  <div className="pl-pd">{s.body}</div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="pl-section" id="pl-faq">
        <div className="pl-sec-in pl-faq-in">
          <div className="pl-sec-eyebrow">Frequently asked</div>
          <h2 className="pl-sec-h">Frequently asked questions.</h2>
          {contentStatus === 'ready' && faqs.length > 0 ? (
            <div className="pl-faqs">
              {faqs.map((f, i) => (
                <div key={f.q} className={`pl-faq-item${openFaq === i ? ' open' : ''}`}>
                  <button
                    type="button"
                    className="pl-faq-q"
                    aria-expanded={openFaq === i}
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span>{f.q}</span>
                    <span className="pl-faq-i" aria-hidden="true">+</span>
                  </button>
                  <div className="pl-faq-a">{f.a}</div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <div className="pl-cta">
        <div className="pl-cta-in">
          <div className="pl-cta-eyebrow">Get started</div>
          <h2 className="pl-cta-h">Your data has value.<br />Let the firm <em>use it.</em></h2>
          <p className="pl-cta-p">Publish to the Data Marketplace &mdash; governed, contextualised, and discoverable from the moment you register.</p>
          <div className="pl-cta-btns">
            <button type="button" className="btn-dk btn-lg" disabled title="Catalogue is out of scope for this delivery">Browse the catalogue</button>
          </div>
        </div>
      </div>

      <footer className="pl-foot">
        <div className="pl-foot-l">
          <span className="pl-foot-brand">Data Marketplace</span>
          <span className="pl-foot-meta">CIB Data Services · Internal use only</span>
        </div>
        <div className="pl-foot-r">© 2026 Wells Fargo</div>
      </footer>
    </div>
  );
}
