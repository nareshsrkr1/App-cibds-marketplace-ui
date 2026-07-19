import { useEffect, useState } from 'react';
import { fetchLandingProofStats } from './landing.api';
import type { Capability, DiagramNode, FaqItem, PipelineStep, ProofStat } from './landing.types';
import './landing.css';

const DIAGRAM: DiagramNode[] = [
  { kind: 'app', k: 'A team has data', id: 'Producer', d: 'e.g. a trading desk', connLabel: 'lists it' },
  { kind: 'offer', k: 'They publish it to the marketplace', id: 'Published dataset', d: 'described, classified, owned', connLabel: 'someone finds it' },
  { kind: 'dataset', k: 'Another team wants it', id: 'Consumer', d: 'e.g. risk or reporting', connLabel: 'requests access' },
  { kind: 'contract', k: 'The owner approves', id: 'Agreement', d: 'terms agreed & recorded', connLabel: 'data flows', thinConn: true },
  { kind: 'sub', k: 'Data is delivered', id: 'Live feed', d: 'governed, traceable' },
];

const CAPS: Capability[] = [
  { n: '01', title: 'List your data', body: 'A team publishes the data it owns to the marketplace — what it is, who owns it, and how sensitive it is. This becomes the single source everyone can rely on.', tags: ['Ownership', 'Sensitivity', 'Description'] },
  { n: '02', title: 'Explain what it means', body: 'Each field is matched to a shared business definition, so a column like “cpty_id” is understood by everyone as “Counterparty” — no guesswork, no tribal knowledge.', tags: ['Shared definitions', 'Lineage', 'Approved'] },
  { n: '03', title: 'Keep it trusted', body: 'Nothing moves until it’s checked, classified and approved. Every access is controlled and recorded, so the firm always knows who has what and why.', tags: ['Contracts', 'Audit', 'Access control'] },
  { n: '04', title: 'Give it meaning', body: 'Numbers alone are noise. The marketplace captures plain-English definitions and context, so anyone can understand a dataset — not just open it.', tags: ['Plain-English', 'Definitions', 'Domain'] },
  { n: '05', title: 'Trace it end to end', body: 'See exactly where any piece of data came from and where it goes — from the original source all the way to the person consuming it.', tags: ['Source to consumer', 'Traceability', 'Provenance'] },
  { n: '06', title: 'A shared ontology, made navigable', body: 'Every dataset, definition, owner and lineage path is woven into one ontology — a connected model of what the firm’s data means. The context fabric sits over it, so you can ask in plain English what data exists, what it means and where it flows, and get an answer grounded in that shared context rather than guesswork.', tags: ['Ontology', 'Connected context', 'Ask in plain English'], ai: true, aiTag: 'Context Fabric' },
];

const STEPS: PipelineStep[] = [
  { n: '1', title: 'Produce', body: 'A team creates data as part of its daily work' },
  { n: '2', title: 'Publish', body: 'They list it in the marketplace and describe what each field means' },
  { n: '3', title: 'Govern', body: "It's checked, classified and approved before anyone can use it" },
  { n: '4', title: 'Share', body: 'Another team requests it; the owner approves and terms are agreed' },
  { n: '5', title: 'Consume', body: 'Data is delivered as a trusted, traceable feed' },
];

const FAQS: FaqItem[] = [
  { q: 'What is the difference between a business term, a data element, and a column?', a: 'A business term is the language the business speaks. A business data element (BDE) is the governed definition beneath it. A physical data element (PDE) is the actual column in a source file. Binding connects a column to an element; the element realises a term.' },
  { q: 'Who can publish bindings without governance review?', a: 'A producer can publish directly when every column binds to an already-endorsed business data element. When a producer proposes a new element, or a column can\'t be mapped, that item routes to Data Governance for endorsement before it can be published.' },
  { q: 'How is a dataset classified?', a: "Classification is inherited from the business data elements a dataset's columns bind to, rather than declared by hand. Sensitivity, PII status and criticality travel with the element, so the dataset's governance profile is derived from what it actually contains." },
  { q: 'What is the registration approval SLA?', a: 'The standard review SLA is 2 business days from submission. Datasets flagged for PII or classified as Confidential may require up to 5 business days. Expedited review is available for production-critical submissions — coordinate with the Data Marketplace governance team.' },
];

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function LandingPage() {
  const [stats, setStats] = useState<ProofStat[] | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'empty' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    fetchLandingProofStats().then((res) => {
      if (cancelled) return;
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
    });
    return () => {
      cancelled = true;
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
          <button type="button" className="btn-dk pl-nav-cta" disabled title="Workspace is out of scope for this delivery">Open workspace →</button>
        </div>
      </nav>

      <section className="pl-hero">
        <div className="pl-hero-in">
          <div className="pl-hero-l">
            <div className="pl-eyebrow">Wells Fargo · Corporate &amp; Investment Banking</div>
            <h1>Data that moves the<br /><em>firm forward.</em></h1>
            <p className="pl-hero-p">The single governed marketplace for the firm's data. Teams publish the data they own; it’s checked and classified; and anyone across the firm can find it, understand it, and get access under clear terms — with full traceability from source to consumer.</p>
            <div className="pl-hero-actions">
              <button type="button" className="btn-dk btn-lg" disabled title="Workspace is out of scope for this delivery">Open workspace →</button>
              <button type="button" className="btn-lt btn-lg" disabled title="Catalogue is out of scope for this delivery">Browse the catalogue</button>
            </div>
          </div>
          <div className="pl-hero-r">
            <div className="pl-diagram">
              <div className="pl-dg-h">How data moves</div>
              <div className="pl-dg-flow">
                {DIAGRAM.map((node, i) => (
                  <div key={node.id}>
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
                    {/* keep key usage stable */}
                    {i < 0 ? null : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {status === 'loading' && <div className="state-banner loading" role="status">Loading marketplace metrics…</div>}
      {status === 'error' && <div className="state-banner error" role="alert">{error ?? 'Unable to load metrics.'}</div>}
      {status === 'empty' && <div className="state-banner empty">No marketplace metrics available yet.</div>}

      {status === 'ready' && stats && (
        <div className="pl-proof">
          <div className="pl-proof-in">
            {stats.map((s) => (
              <div className="pl-pf" key={s.label}>
                <span className="pl-pf-v">{s.value}</span>
                <span className="pl-pf-l">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <section className="pl-section" id="pl-cap">
        <div className="pl-sec-in">
          <div className="pl-sec-eyebrow">Platform capabilities</div>
          <h2 className="pl-sec-h">Six reasons data moves with confidence.</h2>
          <p className="pl-sec-lead">The Data Marketplace is not a filing system. It is the infrastructure that turns raw data into a firm asset &mdash; discoverable, trusted, and ready to use.</p>
          <div className="pl-caps">
            {CAPS.map((c) => (
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
        </div>
      </section>

      <section className="pl-section pl-how" id="pl-how">
        <div className="pl-sec-in">
          <div className="pl-sec-eyebrow">How it works</div>
          <h2 className="pl-sec-h">From one team to another — safely, and traceably.</h2>
          <p className="pl-sec-lead">Every dataset follows the same simple path — with meaning and traceability captured at every step. Underneath, a shared ontology and context fabric link it all together, so the marketplace can explain any dataset in plain language while people stay in control of every decision.</p>
          <div className="pl-pipeline">
            {STEPS.map((s) => (
              <div className="pl-pstep" key={s.n}>
                <div className="pl-pdot">{s.n}</div>
                <div className="pl-ph">{s.title}</div>
                <div className="pl-pd">{s.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pl-section" id="pl-faq">
        <div className="pl-sec-in pl-faq-in">
          <div className="pl-sec-eyebrow">Frequently asked</div>
          <h2 className="pl-sec-h">Frequently asked questions.</h2>
          <div className="pl-faqs">
            {FAQS.map((f, i) => (
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
