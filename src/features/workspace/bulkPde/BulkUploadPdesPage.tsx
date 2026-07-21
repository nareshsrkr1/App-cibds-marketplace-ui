import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConsoleHeader } from '../components/ConsoleHeader';
import { ErrorState } from '../../../components/feedback/ErrorState/ErrorState';
import { Spinner } from '../../../components/feedback/Spinner/Spinner';
import { toast } from '../../../services/toastService';
import { WORKSPACE_ROUTES } from '../workspaceRoutes';
import {
  fetchBulkPdeApplications,
  fetchBulkPdeTemplate,
  registerBulkPde,
} from './bulkPde.api';
import type {
  BulkPdeApplication,
  BulkPdeMintedDataset,
  BulkPdeRow,
  BulkPdeRowSource,
  BulkPdeStage,
} from './bulkPde.types';
import { parseBulkPdeCsv } from './bulkPde.parseCsv';
import { BULK_PDE_SAMPLE_ROWS } from './bulkPde.sample';
import { summarizeBulkPdeRows } from './bulkPde.validate';
import { BulkPdeReview } from './components/BulkPdeReview';
import { BulkPdeSetup } from './components/BulkPdeSetup';
import { BulkPdeSuccess } from './components/BulkPdeSuccess';
import './bulkPde.css';

function readFileAsText(file: File): Promise<string> {
  if (typeof file.text === 'function') {
    return file.text();
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('Unable to read file.'));
    reader.readAsText(file);
  });
}

export function BulkUploadPdesPage() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<BulkPdeStage>('setup');
  const [appsStatus, setAppsStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [appsError, setAppsError] = useState<string | null>(null);
  const [applications, setApplications] = useState<BulkPdeApplication[]>([]);
  const [selectedAppId, setSelectedAppId] = useState('');
  const [templateColumns, setTemplateColumns] = useState<string[]>([]);
  const [templateBusy, setTemplateBusy] = useState(false);
  const [parseBusy, setParseBusy] = useState(false);
  const [registerBusy, setRegisterBusy] = useState(false);
  const [rows, setRows] = useState<BulkPdeRow[]>([]);
  const [rowSource, setRowSource] = useState<BulkPdeRowSource | null>(null);
  const [result, setResult] = useState<{
    count: number;
    offerId: string;
    datasets: BulkPdeMintedDataset[];
  } | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const registerAc = useRef<AbortController | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    setAppsStatus('loading');
    setAppsError(null);
    void fetchBulkPdeApplications({ signal: ac.signal })
      .then((res) => {
        if (ac.signal.aborted) return;
        if (!res.ok) {
          setAppsStatus('error');
          setAppsError(res.error);
          setApplications([]);
          return;
        }
        setApplications(res.data.applications ?? []);
        setAppsStatus('ready');
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setAppsStatus('error');
        setAppsError(err instanceof Error ? err.message : 'Unable to load applications.');
      });
    return () => ac.abort();
  }, [reloadToken]);

  useEffect(() => {
    return () => {
      registerAc.current?.abort();
    };
  }, []);

  const selectedApp = applications.find((a) => a.id === selectedAppId);

  const handleDownloadTemplate = async () => {
    setTemplateBusy(true);
    try {
      const res = await fetchBulkPdeTemplate();
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      const { columns, sampleRow, filename } = res.data;
      setTemplateColumns(columns);
      const csv = `${columns.join(',')}\n${sampleRow.join(',')}\n`;
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'pde_template.csv';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('CSV template downloaded.');
    } finally {
      setTemplateBusy(false);
    }
  };

  const goToReview = (nextRows: BulkPdeRow[], source: BulkPdeRowSource) => {
    setRows(nextRows);
    setRowSource(source);
    setResult(null);
    setStage('review');
  };

  const handleFileSelected = async (file: File) => {
    if (!selectedAppId) return;
    if (!/\.csv$/i.test(file.name) && file.type !== 'text/csv') {
      toast.error('Please upload a CSV file.');
      return;
    }
    setParseBusy(true);
    try {
      const text = await readFileAsText(file);
      const parsed = parseBulkPdeCsv(text);
      if (parsed.length === 0) {
        toast.error('No data rows found in the CSV.');
        return;
      }
      goToReview(parsed, 'file');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Unable to read CSV.');
    } finally {
      setParseBusy(false);
    }
  };

  const handleLoadSample = () => {
    if (!selectedAppId) return;
    goToReview(
      BULK_PDE_SAMPLE_ROWS.map((row) => ({ ...row })),
      'sample',
    );
  };

  const handleStartOver = () => {
    registerAc.current?.abort();
    setParseBusy(false);
    setRegisterBusy(false);
    setRows([]);
    setRowSource(null);
    setResult(null);
    setStage('setup');
  };

  const handleRegister = async () => {
    if (!selectedApp || rowSource !== 'file') return;
    const { validRows } = summarizeBulkPdeRows(rows);
    if (validRows.length === 0) return;

    registerAc.current?.abort();
    const ac = new AbortController();
    registerAc.current = ac;
    setRegisterBusy(true);
    try {
      const res = await registerBulkPde(
        {
          applicationId: selectedApp.id,
          offerId: selectedApp.offerId,
          rows: validRows,
        },
        { signal: ac.signal },
      );
      if (ac.signal.aborted) return;
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setResult({
        count: res.data.count,
        offerId: res.data.offerId,
        datasets: res.data.datasets,
      });
      setStage('success');
      toast.success(`${res.data.count} PDEs registered.`);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      toast.error(err instanceof Error ? err.message : 'Unable to register PDEs.');
    } finally {
      if (registerAc.current === ac) setRegisterBusy(false);
    }
  };

  const handleBindNow = () => {
    const first = result?.datasets[0];
    if (!first) {
      navigate(WORKSPACE_ROUTES.bind);
      return;
    }
    const params = new URLSearchParams({
      datasetId: first.dsId,
      name: first.name,
    });
    if (result.offerId) params.set('offerId', result.offerId);
    navigate(`${WORKSPACE_ROUTES.bind}?${params.toString()}`);
  };

  if (appsStatus === 'loading') {
    return (
      <div className="bulk-pde" data-testid="bulk-upload-pdes">
        <ConsoleHeader
          eyebrow="Producer · Bulk registration"
          greeting="Bulk upload PDEs."
          subtitle="Register many physical columns at once — with validation, type inference, and a direct path into binding."
        />
        <div className="bulk-pde-loading" role="status" aria-label="Loading applications">
          <Spinner size="lg" label="Loading applications" />
        </div>
      </div>
    );
  }

  if (appsStatus === 'error') {
    return (
      <div className="bulk-pde" data-testid="bulk-upload-pdes">
        <ConsoleHeader
          eyebrow="Producer · Bulk registration"
          greeting="Bulk upload PDEs."
          subtitle="Register many physical columns at once — with validation, type inference, and a direct path into binding."
        />
        <div className="workspace-state workspace-state--main">
          <ErrorState
            title="Unable to load applications"
            description={appsError ?? 'Bulk PDE applications are unavailable.'}
            onRetry={() => setReloadToken((n) => n + 1)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bulk-pde" data-testid="bulk-upload-pdes">
      <ConsoleHeader
        eyebrow="Producer · Bulk registration"
        greeting="Bulk upload PDEs."
        subtitle="Register many physical columns at once — with validation, type inference, and a direct path into binding."
      />

      {stage === 'setup' ? (
        <BulkPdeSetup
          applications={applications}
          selectedAppId={selectedAppId}
          onSelectApp={setSelectedAppId}
          onDownloadTemplate={() => void handleDownloadTemplate()}
          onFileSelected={(file) => void handleFileSelected(file)}
          onLoadSample={handleLoadSample}
          templateBusy={templateBusy}
          parseBusy={parseBusy}
          templateColumns={
            templateColumns.length > 0
              ? templateColumns
              : [
                  'dataset',
                  'column',
                  'type',
                  'length',
                  'nullable',
                  'pii',
                  'sourceMapping',
                  'validValues',
                  'description',
                ]
          }
        />
      ) : null}

      {stage === 'review' && rowSource ? (
        <BulkPdeReview
          rows={rows}
          source={rowSource}
          registerBusy={registerBusy}
          onStartOver={handleStartOver}
          onRegister={() => void handleRegister()}
        />
      ) : null}

      {stage === 'success' && result ? (
        <BulkPdeSuccess
          count={result.count}
          offerId={result.offerId}
          datasets={result.datasets}
          onUploadMore={handleStartOver}
          onBindNow={handleBindNow}
        />
      ) : null}
    </div>
  );
}
