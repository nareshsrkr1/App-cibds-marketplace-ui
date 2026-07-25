import { useEffect, useMemo, useState } from 'react';
import { Modal } from '../../../../components/ui/Modal/Modal';
import { Spinner } from '../../../../components/feedback/Spinner/Spinner';
import { fetchLineageDetails, fetchLineageSummaries } from '../lineage.api';
import { fetchLogicalModel } from '../../logicalModel/logicalModel.api';
import { buildSankeyData, type SankeyData, type SankeyNode } from '../lineage.sankey';
import type { LineageDetail, LineageSummary } from '../lineage.types';
import type { LogicalDataset } from '../../logicalModel/logicalModel.types';
import { SankeyDiagram } from './SankeyDiagram';
import { LineageDetailPanel, type DetailView } from './LineageDetailPanel';

export type LineageModalProps = {
  open: boolean;
  lineageKey: string | null;
  onClose: () => void;
};

function parseNodeId(id: string): { kind: string; key?: string; datasetName?: string } {
  const parts = id.split(':');
  if (parts[0] === 'bde') return { kind: 'bde', key: parts.slice(1).join(':') };
  // Dataset/column nodes are shared across every BDE that realizes them (see
  // buildFromBdeList in lineage.sankey.ts) — the id carries only the dataset name, not a
  // single owning BDE key.
  if (parts[0] === 'ds' || parts[0] === 'col') {
    return { kind: parts[0], datasetName: parts.slice(1).join(':') };
  }
  return { kind: 'root' };
}

function buildDetailView(
  node: SankeyNode,
  lineageKey: string,
  details: LineageDetail[],
  sankeyData: SankeyData,
): DetailView | null {
  const parsed = parseNodeId(node.id);

  if (parsed.kind === 'root') {
    if (lineageKey.startsWith('LD::')) {
      return {
        title: node.label,
        subtitle: 'Logical dataset',
        rows: [{ label: 'Total columns realised', value: String(node.weight) }],
      };
    }
    const detail = details.find((d) => d.key === lineageKey);
    if (!detail) return null;
    const sors = [...new Set(detail.datasets.map((d) => d.sor))];
    return {
      title: detail.term,
      subtitle: 'Glossary term',
      rows: [
        { label: 'Definition', value: detail.definition },
        { label: 'Subject area', value: detail.subjectArea },
        { label: 'Sub-domain', value: detail.subDomain },
        { label: 'Classification', value: detail.classification },
        { label: 'PII', value: detail.pii ? 'Yes' : 'No' },
        { label: 'Status', value: detail.status },
        { label: 'Realised in', value: `${detail.datasets.length} datasets` },
        { label: 'Source systems', value: sors.join(', ') },
      ],
    };
  }

  if (parsed.kind === 'bde') {
    const detail = details.find((d) => d.key === parsed.key);
    if (!detail) return null;
    return {
      title: node.label,
      subtitle: `Represents ${detail.term}`,
      rows: [
        { label: 'Definition', value: detail.definition },
        { label: 'Subject area', value: detail.subjectArea },
        { label: 'Classification', value: detail.classification },
        { label: 'PII', value: detail.pii ? 'Yes' : 'No' },
        { label: 'Realised in', value: `${detail.datasets.length} datasets` },
      ],
    };
  }

  // 'ds' or 'col' — the node may be shared by more than one BDE in this view (an LD::
  // aggregate lineage), so resolve to the union of every realization across them.
  const bdeKeys = sankeyData.nodes
    .filter((n) => n.kind === 'bde')
    .map((n) => n.id.slice('bde:'.length));
  const columnsByName = new Map<string, LineageDetail['datasets'][number]['columns'][number]>();
  let sor = '';
  for (const key of bdeKeys) {
    const detail = details.find((d) => d.key === key);
    const dataset = detail?.datasets.find((d) => d.datasetName === parsed.datasetName);
    if (!dataset) continue;
    sor = dataset.sor;
    for (const col of dataset.columns) columnsByName.set(col.name, col);
  }
  if (columnsByName.size === 0) return null;
  const columns = [...columnsByName.values()];
  return {
    title: parsed.datasetName ?? '',
    subtitle: `Source system: ${sor}`,
    rows: [{ label: 'Columns realising this element', value: String(columns.length) }],
    columns,
  };
}

export function LineageModal({ open, lineageKey, onClose }: LineageModalProps) {
  const [summaries, setSummaries] = useState<LineageSummary[] | null>(null);
  const [logicalDatasets, setLogicalDatasets] = useState<LogicalDataset[]>([]);
  const [details, setDetails] = useState<LineageDetail[] | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setSelectedNodeId(null);
    if (summaries) return;
    const ac = new AbortController();
    void Promise.all([
      fetchLineageSummaries({ signal: ac.signal }),
      fetchLogicalModel({ signal: ac.signal }),
    ]).then(([summaryResult, modelResult]) => {
      if (ac.signal.aborted) return;
      if (summaryResult.ok) setSummaries(summaryResult.data.entries);
      if (modelResult.ok) setLogicalDatasets(modelResult.data.logicalDatasets);
    });
    return () => ac.abort();
    // Reset on lineageKey too — a future trigger could switch traces without
    // the modal fully closing/reopening in between (open would stay true).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, lineageKey]);

  const sankeyData: SankeyData | null = useMemo(() => {
    if (!open || !lineageKey || !summaries) return null;
    return buildSankeyData(lineageKey, summaries, logicalDatasets);
  }, [open, lineageKey, summaries, logicalDatasets]);

  function handleSelectNode(node: SankeyNode) {
    setSelectedNodeId(node.id);
    if (!details) {
      void fetchLineageDetails().then((result) => {
        if (result.ok) setDetails(result.data.entries);
      });
    }
  }

  const selectedNode = sankeyData?.nodes.find((n) => n.id === selectedNodeId) ?? null;
  const detailView =
    selectedNode && details && lineageKey && sankeyData
      ? buildDetailView(selectedNode, lineageKey, details, sankeyData)
      : null;

  const title = sankeyData?.rootLabel ?? 'Lineage';

  return (
    <Modal open={open} onClose={onClose} title={title} size="wide" headerTheme="navy">
      <div className="lin-modal">
        <div className="lin-eyebrow">Intelligence · Lineage</div>
        {!sankeyData ? (
          <div className="cat-loading" role="status" aria-label="Loading">
            <Spinner size="md" label="Loading lineage" />
          </div>
        ) : (
          <div className="lin-body">
            <div className="lin-legend">
              <span>
                <i className="lin-swatch lin-swatch--root" /> Glossary term
              </span>
              <span>
                <i className="lin-swatch lin-swatch--bde" /> Business element
              </span>
              <span>
                <i className="lin-swatch lin-swatch--dataset" /> Physical dataset
              </span>
              <span>
                <i className="lin-swatch lin-swatch--columns" /> Column
              </span>
            </div>
            <div className="lin-layout">
              <div className="lin-diagram-scroll ui-scroll-box">
                <SankeyDiagram
                  data={sankeyData}
                  selectedNodeId={selectedNodeId}
                  onSelectNode={handleSelectNode}
                />
              </div>
              <LineageDetailPanel view={detailView} />
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
