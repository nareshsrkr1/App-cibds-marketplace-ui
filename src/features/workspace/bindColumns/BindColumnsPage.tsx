import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ConsoleHeader } from '../components/ConsoleHeader';
import { ErrorState } from '../../../components/feedback/ErrorState/ErrorState';
import { Spinner } from '../../../components/feedback/Spinner/Spinner';
import { toast } from '../../../services/toastService';
import {
  fetchBindBdeOptions,
  fetchBindDatasets,
  harvestBindColumns,
  publishBindColumns,
} from './bindColumns.api';
import { buildBindColumnsCsv, parseBindColumnsCsv } from './bindColumns.parseCsv';
import { BIND_SAMPLE_COLUMNS } from './bindColumns.sample';
import type {
  BindApplicationGroup,
  BindColumn,
  BindFilter,
  BindPublishResponse,
  BindResolvedDataset,
  BindReviewPath,
  BindSrcType,
  BindStep,
} from './bindColumns.types';
import { BindHarvest } from './components/BindHarvest';
import { BindMapping } from './components/BindMapping';
import { BindPublishForm } from './components/BindPublishForm';
import { BindReview } from './components/BindReview';
import { BindSource } from './components/BindSource';
import { BindStepper } from './components/BindStepper';
import { BindSuccess } from './components/BindSuccess';
import './bindColumns.css';
import '../bulkPde/bulkPde.css';

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('Unable to read that file.'));
    reader.readAsText(file);
  });
}

function resolveDataset(
  applications: BindApplicationGroup[],
  dsId: string,
): BindResolvedDataset | null {
  for (const app of applications) {
    const d = app.datasets.find((x) => x.dsId === dsId);
    if (d) {
      return {
        ...d,
        app: app.name,
        appId: app.appId,
        offerId: app.offerId,
      };
    }
  }
  return null;
}

function normalizeHarvestColumns(
  rows: Array<{
    col: string;
    type: string;
    len: string;
    nul: string;
    vals: string;
    srcmap: string;
    orig: string;
    pii: string;
    suggest: string;
    method: BindColumn['method'];
    profile?: string;
  }>,
): BindColumn[] {
  return rows.map((r) => ({
    col: r.col,
    type: r.type,
    len: r.len,
    nul: r.nul,
    vals: r.vals,
    srcmap: r.srcmap,
    orig: r.orig,
    pii: r.pii,
    profile: r.profile,
    // Keep harvest suggestions pending until the user accepts (HTML Accept-all was a no-op).
    suggestedBde: r.suggest || '',
    suggest: '',
    method: r.suggest ? 's' : 'n',
    propose: false,
    proposed: false,
    proposeName: '',
    proposeDef: '',
    golden: false,
    cde: false,
    xform: 'Straight copy',
    uom: '',
  }));
}

export function BindColumnsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const presetDs = searchParams.get('datasetId') ?? '';
  const presetName = searchParams.get('name') ?? '';
  const presetOffer = searchParams.get('offerId') ?? '';

  const [step, setStep] = useState<BindStep>('source');
  const [appsStatus, setAppsStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [appsError, setAppsError] = useState<string | null>(null);
  const [applications, setApplications] = useState<BindApplicationGroup[]>([]);
  const [bdeOptions, setBdeOptions] = useState<string[]>([]);
  const [selectedDsId, setSelectedDsId] = useState(presetDs);
  const [srcType, setSrcType] = useState<BindSrcType>('s3');
  const [sourceError, setSourceError] = useState(false);
  const [publishError, setPublishError] = useState(false);
  const [columns, setColumns] = useState<BindColumn[]>([]);
  const [filter, setFilter] = useState<BindFilter>('all');
  const [query, setQuery] = useState('');
  const [contractName, setContractName] = useState('');
  const [reviewPath, setReviewPath] = useState<BindReviewPath>('steward');
  const [harvestBusy, setHarvestBusy] = useState(false);
  const [publishBusy, setPublishBusy] = useState(false);
  const [result, setResult] = useState<BindPublishResponse | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const harvestAc = useRef<AbortController | null>(null);
  const publishAc = useRef<AbortController | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    setAppsStatus('loading');
    setAppsError(null);
    void Promise.all([
      fetchBindDatasets({ signal: ac.signal }),
      fetchBindBdeOptions({ signal: ac.signal }),
    ])
      .then(([dsRes, bdeRes]) => {
        if (ac.signal.aborted) return;
        if (!dsRes.ok) {
          setAppsStatus('error');
          setAppsError(dsRes.error);
          return;
        }
        setApplications(dsRes.data.applications ?? []);
        if (bdeRes.ok) setBdeOptions(bdeRes.data.options ?? []);

        // Deep-link / Bulk PDE handoff: inject minted dataset if not already in registry.
        if (presetDs) {
          const known = (dsRes.data.applications ?? []).some((a) =>
            a.datasets.some((d) => d.dsId === presetDs),
          );
          if (!known) {
            setApplications((prev) => [
              {
                name: 'Recently registered',
                appId: 'APP-CIB-HANDOFF',
                offerId: presetOffer || 'OFR-CIB-HANDOFF',
                datasets: [
                  {
                    dsId: presetDs,
                    name: presetName || presetDs,
                    s3Prefix: 'recently_registered',
                    classification: 'Internal',
                  },
                ],
              },
              ...prev,
            ]);
          }
          setSelectedDsId(presetDs);
        }

        setAppsStatus('ready');
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setAppsStatus('error');
        setAppsError(err instanceof Error ? err.message : 'Unable to load datasets.');
      });
    return () => ac.abort();
  }, [reloadToken]);

  useEffect(() => {
    return () => {
      harvestAc.current?.abort();
      publishAc.current?.abort();
    };
  }, []);

  const resolved = useMemo(
    () => (selectedDsId ? resolveDataset(applications, selectedDsId) : null),
    [applications, selectedDsId],
  );

  const wizardStep = step === 'success' ? 'review' : step;

  const resetFlow = () => {
    harvestAc.current?.abort();
    publishAc.current?.abort();
    setStep('source');
    setSrcType('s3');
    setSourceError(false);
    setPublishError(false);
    setColumns([]);
    setFilter('all');
    setQuery('');
    setContractName('');
    setReviewPath('steward');
    setHarvestBusy(false);
    setPublishBusy(false);
    setResult(null);
  };

  const runHarvest = async () => {
    if (!selectedDsId) return;
    harvestAc.current?.abort();
    const ac = new AbortController();
    harvestAc.current = ac;
    setHarvestBusy(true);
    try {
      const res = await harvestBindColumns(
        { datasetId: selectedDsId },
        { signal: ac.signal },
      );
      if (ac.signal.aborted) return;
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setColumns(normalizeHarvestColumns(res.data.columns ?? []));
      setStep('harvest');
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      toast.error(err instanceof Error ? err.message : 'Unable to harvest columns.');
    } finally {
      if (harvestAc.current === ac) setHarvestBusy(false);
    }
  };

  const handleDownloadSample = () => {
    const csv = buildBindColumnsCsv(BIND_SAMPLE_COLUMNS);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bind_columns_sample.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Sample CSV downloaded.');
  };

  const handleOtherFileSelected = async (file: File) => {
    setHarvestBusy(true);
    try {
      const text = await readFileAsText(file);
      const parsed = parseBindColumnsCsv(text);
      if (parsed.length === 0) {
        toast.error('No columns found in that file. Check the CSV headers.');
        return;
      }
      setColumns(parsed);
      toast.success(`Loaded ${parsed.length} column${parsed.length !== 1 ? 's' : ''} from ${file.name}.`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Unable to read that file.');
    } finally {
      setHarvestBusy(false);
    }
  };

  const handleSourceNext = () => {
    if (!selectedDsId || !resolved) {
      setSourceError(true);
      return;
    }
    setSourceError(false);
    setColumns([]);
    if (srcType === 's3') {
      void runHarvest();
    } else {
      setStep('harvest');
    }
  };

  const handleHarvestNext = () => {
    if (columns.length === 0) {
      toast.error('Load columns before continuing to bind.');
      return;
    }
    setStep('bind');
  };

  const handleBindChange = (index: number, value: string) => {
    setColumns((prev) =>
      prev.map((c, i) => {
        if (i !== index) return c;
        if (value === '__propose') {
          return {
            ...c,
            propose: true,
            suggest: '',
            method: 'n',
            proposed: false,
          };
        }
        if (!value) {
          return {
            ...c,
            suggest: '',
            method: 'n',
            propose: false,
            proposed: false,
          };
        }
        const isSuggested = value === c.suggestedBde;
        return {
          ...c,
          suggest: value,
          method: isSuggested ? 's' : 'm',
          propose: false,
          proposed: false,
        };
      }),
    );
  };

  const handleAcceptSuggested = () => {
    const pending = columns.filter(
      (c) => c.suggestedBde && c.suggest !== c.suggestedBde,
    );
    if (pending.length === 0) {
      toast.info('All suggested bindings are already applied.');
      return;
    }
    setColumns((prev) =>
      prev.map((c) =>
        c.suggestedBde
          ? {
              ...c,
              suggest: c.suggestedBde,
              method: 's',
              propose: false,
              proposed: false,
            }
          : c,
      ),
    );
    toast.success(
      `Accepted ${pending.length} suggested binding${pending.length !== 1 ? 's' : ''}.`,
    );
  };

  const handleColumnMeta = (
    index: number,
    patch: Partial<Pick<BindColumn, 'golden' | 'cde' | 'xform' | 'uom'>>,
  ) => {
    setColumns((prev) =>
      prev.map((c, i) => (i === index ? { ...c, ...patch } : c)),
    );
  };

  const handleProposeField = (
    index: number,
    field: 'proposeName' | 'proposeDef',
    value: string,
  ) => {
    setColumns((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)),
    );
  };

  const handleSubmitPropose = (index: number) => {
    const c = columns[index];
    if (!c?.proposeName?.trim() || !c.proposeDef?.trim()) {
      toast.error('Enter a BDE name and definition.');
      return;
    }
    setColumns((prev) =>
      prev.map((row, i) =>
        i === index
          ? {
              ...row,
              proposed: true,
              propose: false,
              suggest: `Proposed: ${row.proposeName!.trim()}`,
              method: 'p',
            }
          : row,
      ),
    );
    toast.success('Proposal queued for governance.');
  };

  const handlePublishNext = () => {
    if (!contractName.trim()) {
      setPublishError(true);
      return;
    }
    setPublishError(false);
    setStep('review');
  };

  const handlePublish = async () => {
    if (!resolved || !contractName.trim()) return;
    publishAc.current?.abort();
    const ac = new AbortController();
    publishAc.current = ac;
    setPublishBusy(true);
    try {
      const res = await publishBindColumns(
        {
          datasetId: resolved.dsId,
          offerId: resolved.offerId,
          contractName: contractName.trim(),
          reviewPath,
          columns: columns.map((c) => ({
            col: c.col,
            type: c.type,
            len: c.len,
            nul: c.nul,
            srcmap: c.srcmap,
            orig: c.orig,
            vals: c.vals,
            pii: c.pii,
            boundTo: c.suggest,
            bindMethod:
              c.method === 's'
                ? 'suggested'
                : c.method === 'p'
                  ? 'proposed'
                  : c.method === 'm'
                    ? 'manual'
                    : 'none',
          })),
        },
        { signal: ac.signal },
      );
      if (ac.signal.aborted) return;
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setResult(res.data);
      setStep('success');
      toast.success('Bindings published.');
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      toast.error(err instanceof Error ? err.message : 'Unable to publish bindings.');
    } finally {
      if (publishAc.current === ac) setPublishBusy(false);
    }
  };

  const nextLabel = () => {
    if (step === 'source') {
      return srcType === 's3' ? 'Harvest from S3 →' : 'Continue →';
    }
    if (step === 'review') return publishBusy ? 'Publishing…' : 'Publish bindings ✓';
    return 'Continue →';
  };

  const canPrimary =
    step === 'source'
      ? Boolean(selectedDsId) && !harvestBusy
      : step === 'harvest'
        ? columns.length > 0
        : step === 'bind'
          ? true
          : step === 'publish'
            ? true
            : step === 'review'
              ? !publishBusy
              : false;

  const showPrimary = step !== 'source' || Boolean(selectedDsId);

  if (appsStatus === 'loading') {
    return (
      <div className="bind-columns" data-testid="bind-columns">
        <ConsoleHeader
          eyebrow="Physical · Bind & Publish"
          greeting="Bind columns to business elements."
          subtitle="Attach harvested physical columns to endorsed business data elements — then publish the dataset contract."
        />
        <div className="bind-loading" role="status" aria-label="Loading datasets">
          <Spinner size="lg" label="Loading datasets" />
        </div>
      </div>
    );
  }

  if (appsStatus === 'error') {
    return (
      <div className="bind-columns" data-testid="bind-columns">
        <ConsoleHeader
          eyebrow="Physical · Bind & Publish"
          greeting="Bind columns to business elements."
          subtitle="Attach harvested physical columns to endorsed business data elements — then publish the dataset contract."
        />
        <div className="workspace-state workspace-state--main">
          <ErrorState
            title="Unable to load datasets"
            description={appsError ?? 'Bind columns datasets are unavailable.'}
            onRetry={() => setReloadToken((n) => n + 1)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bind-columns" data-testid="bind-columns">
      <ConsoleHeader
        eyebrow="Physical · Bind & Publish"
        greeting="Bind columns to business elements."
        subtitle="Attach harvested physical columns to endorsed business data elements — then publish the dataset contract."
      />

      {step !== 'success' ? <BindStepper step={wizardStep} /> : null}

      {resolved && step !== 'source' && step !== 'success' ? (
        <div className="rw-idstrip">
          <span className="ris-item">
            <span className="ris-l">Offer</span>
            <span className="ris-v mono">{resolved.offerId}</span>
          </span>
          <span className="ris-sep">·</span>
          <span className="ris-item">
            <span className="ris-l">Dataset</span>
            <span className="ris-v mono">{resolved.dsId}</span>
          </span>
          <span className="ris-name">{resolved.name}</span>
        </div>
      ) : null}

      {step === 'source' ? (
        <BindSource
          applications={applications}
          selectedDsId={selectedDsId}
          srcType={srcType}
          showError={sourceError}
          onSelectDataset={(id) => {
            setSelectedDsId(id);
            setSourceError(false);
            setColumns([]);
          }}
          onSrcType={(s) => {
            setSrcType(s);
            setColumns([]);
          }}
          resolved={resolved}
        />
      ) : null}

      {step === 'harvest' && resolved ? (
        <BindHarvest
          resolved={resolved}
          srcType={srcType}
          columns={columns}
          harvestBusy={harvestBusy}
          onDownloadSample={handleDownloadSample}
          onFileSelected={handleOtherFileSelected}
        />
      ) : null}

      {step === 'bind' ? (
        <BindMapping
          columns={columns}
          bdeOptions={bdeOptions}
          filter={filter}
          query={query}
          onFilter={setFilter}
          onQuery={setQuery}
          onBindChange={handleBindChange}
          onAcceptSuggested={handleAcceptSuggested}
          onProposeField={handleProposeField}
          onSubmitPropose={handleSubmitPropose}
          onColumnMeta={handleColumnMeta}
        />
      ) : null}

      {step === 'publish' && resolved ? (
        <BindPublishForm
          contractName={contractName}
          reviewPath={reviewPath}
          offerId={resolved.offerId}
          showError={publishError}
          onContractName={(v) => {
            setContractName(v);
            setPublishError(false);
          }}
          onReviewPath={setReviewPath}
        />
      ) : null}

      {step === 'review' && resolved ? (
        <BindReview
          resolved={resolved}
          columns={columns}
          contractName={contractName}
          reviewPath={reviewPath}
          srcType={srcType}
        />
      ) : null}

      {step === 'success' && result ? (
        <BindSuccess
          result={result}
          onDone={() => navigate('/workspace')}
          onBindAnother={resetFlow}
        />
      ) : null}

      {step !== 'success' ? (
        <div className="bulk-acts bind-foot">
          {step !== 'source' ? (
            <button
              type="button"
              className="btn-lt"
              disabled={harvestBusy || publishBusy}
              onClick={() => {
                if (step === 'harvest') setStep('source');
                else if (step === 'bind') setStep('harvest');
                else if (step === 'publish') setStep('bind');
                else if (step === 'review') setStep('publish');
              }}
            >
              ← Back
            </button>
          ) : null}
          <div className="spacer" />
          {showPrimary ? (
            <button
              type="button"
              className={`btn-dk${harvestBusy || publishBusy ? ' is-busy' : ''}`}
              disabled={!canPrimary}
              aria-busy={harvestBusy || publishBusy}
              onClick={() => {
                if (step === 'source') handleSourceNext();
                else if (step === 'harvest') handleHarvestNext();
                else if (step === 'bind') setStep('publish');
                else if (step === 'publish') handlePublishNext();
                else if (step === 'review') void handlePublish();
              }}
            >
              {nextLabel()}
            </button>
          ) : (
            <p className="bind-foot-hint">Select a dataset to continue.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
