import type { LogicalDataset } from '../logicalModel/logicalModel.types';
import type { LineageSummary } from './lineage.types';

export type SankeyNodeKind = 'root' | 'bde' | 'dataset' | 'columns';

export type SankeyNode = {
  id: string;
  label: string;
  sublabel?: string;
  kind: SankeyNodeKind;
  /** Column-weight this node represents — used only to lightly vary ribbon thickness. */
  weight: number;
  sor?: string;
};

export type SankeyLink = {
  sourceId: string;
  targetId: string;
  weight: number;
};

export type SankeyData = {
  rootLabel: string;
  nodes: SankeyNode[];
  links: SankeyLink[];
};

const LD_PREFIX = 'LD::';

/**
 * Builds the 4-tier Sankey graph (root → BDE → dataset → column-group) for a lineage key.
 * `key` is either a BDE/glossary-term name (1:1 in this app's data model — see
 * logicalModel.adapter.ts) or `LD::<logical dataset name>` for a dataset-scoped view
 * spanning every BDE that logical dataset owns.
 */
export function buildSankeyData(
  key: string,
  summaries: LineageSummary[],
  logicalDatasets: LogicalDataset[],
): SankeyData | null {
  if (key.startsWith(LD_PREFIX)) {
    const ldName = key.slice(LD_PREFIX.length);
    const dataset = logicalDatasets.find((d) => d.name === ldName);
    if (!dataset) return null;
    const memberSummaries = summaries.filter((s) => dataset.bdeNames.includes(s.bdeName));
    return buildFromBdeList(ldName, memberSummaries);
  }

  const summary = summaries.find((s) => s.key === key);
  if (!summary) return null;
  return buildFromBdeList(summary.term, [summary]);
}

/**
 * `summaries` can list more than one BDE (an `LD::` aggregate view). When two BDEs realize
 * the *same* physical dataset, the dataset/column nodes are shared — one box with two
 * incoming links — rather than duplicated per BDE, which is what made multi-BDE diagrams
 * balloon into tall, repetitive-looking stacks of near-identical rows.
 */
function buildFromBdeList(rootLabel: string, summaries: LineageSummary[]): SankeyData {
  const nodes: SankeyNode[] = [
    { id: 'root', label: rootLabel, kind: 'root', weight: sumColumns(summaries) },
  ];
  const links: SankeyLink[] = [];
  const datasetNodes = new Map<string, SankeyNode>();

  for (const summary of summaries) {
    const bdeNodeId = `bde:${summary.key}`;
    nodes.push({
      id: bdeNodeId,
      label: summary.bdeName,
      sublabel: summary.bdeId,
      kind: 'bde',
      weight: summary.columnCount,
    });
    links.push({ sourceId: 'root', targetId: bdeNodeId, weight: summary.columnCount });

    for (const ds of summary.datasets) {
      const dsNodeId = `ds:${ds.datasetName}`;
      let dsNode = datasetNodes.get(ds.datasetName);
      if (!dsNode) {
        dsNode = { id: dsNodeId, label: ds.datasetName, kind: 'dataset', weight: 0, sor: ds.sor };
        datasetNodes.set(ds.datasetName, dsNode);
        nodes.push(dsNode);
      }
      dsNode.weight += ds.columnCount;
      links.push({ sourceId: bdeNodeId, targetId: dsNodeId, weight: ds.columnCount });
    }
  }

  for (const dsNode of datasetNodes.values()) {
    const colNodeId = `col:${dsNode.label}`;
    nodes.push({
      id: colNodeId,
      label: `${dsNode.weight} column${dsNode.weight === 1 ? '' : 's'}`,
      kind: 'columns',
      weight: dsNode.weight,
    });
    links.push({ sourceId: dsNode.id, targetId: colNodeId, weight: dsNode.weight });
  }

  return { rootLabel, nodes, links };
}

function sumColumns(summaries: LineageSummary[]): number {
  return summaries.reduce((sum, s) => sum + s.columnCount, 0);
}

/** A `SankeyNode` after layout has fixed its box position — every box is the same size. */
export type PositionedSankeyNode = SankeyNode & {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type PositionedSankeyLink = {
  source: PositionedSankeyNode;
  target: PositionedSankeyNode;
  strokeWidth: number;
};

export type SankeyLayout = {
  rootLabel: string;
  nodes: PositionedSankeyNode[];
  links: PositionedSankeyLink[];
  width: number;
  height: number;
};

const TIERS: SankeyNodeKind[] = ['root', 'bde', 'dataset', 'columns'];
const NODE_WIDTH = 168;
const NODE_HEIGHT = 72;
const NODE_GAP = 18;
const TIER_GAP = 56;
const PAD = 20;
const MIN_STROKE = 3;
const MAX_STROKE = 12;

/**
 * Deliberately NOT a value-proportional Sankey layout — every node renders as the same
 * fixed-size card, evenly spaced and vertically centered within its column, connected by
 * smooth curves whose thickness varies only subtly with weight. A true value-proportional
 * Sankey (where a lone child stretches to fill 100% of the column's height) is the right
 * model for comparing many aggregate flows at once; it's the wrong one for a single-item
 * drill-down like this, where most columns have just one or two boxes and stretching them
 * to fill the diagram just produces oversized, awkwardly-labelled rectangles.
 */
export function layoutSankey(data: SankeyData): SankeyLayout {
  const byKind = new Map(TIERS.map((kind) => [kind, data.nodes.filter((n) => n.kind === kind)]));
  const maxCount = Math.max(1, ...TIERS.map((kind) => byKind.get(kind)?.length ?? 0));
  const height = PAD * 2 + maxCount * NODE_HEIGHT + (maxCount - 1) * NODE_GAP;
  const width = PAD * 2 + TIERS.length * NODE_WIDTH + (TIERS.length - 1) * TIER_GAP;

  const positioned = new Map<string, PositionedSankeyNode>();
  TIERS.forEach((kind, tierIndex) => {
    const nodesInTier = byKind.get(kind) ?? [];
    const stackHeight = nodesInTier.length * NODE_HEIGHT + Math.max(0, nodesInTier.length - 1) * NODE_GAP;
    let y = PAD + (height - PAD * 2 - stackHeight) / 2;
    const x = PAD + tierIndex * (NODE_WIDTH + TIER_GAP);
    for (const node of nodesInTier) {
      positioned.set(node.id, { ...node, x, y, width: NODE_WIDTH, height: NODE_HEIGHT });
      y += NODE_HEIGHT + NODE_GAP;
    }
  });

  const maxWeight = Math.max(1, ...data.links.map((l) => l.weight));
  const links: PositionedSankeyLink[] = data.links
    .map((l) => {
      const source = positioned.get(l.sourceId);
      const target = positioned.get(l.targetId);
      if (!source || !target) return null;
      const strokeWidth = MIN_STROKE + (l.weight / maxWeight) * (MAX_STROKE - MIN_STROKE);
      return { source, target, strokeWidth };
    })
    .filter((l): l is PositionedSankeyLink => l !== null);

  return { rootLabel: data.rootLabel, nodes: [...positioned.values()], links, width, height };
}

/** Smooth horizontal "S" curve connecting the vertical center of two node boxes. */
export function sankeyLinkPath(link: PositionedSankeyLink): string {
  const x1 = link.source.x + link.source.width;
  const y1 = link.source.y + link.source.height / 2;
  const x2 = link.target.x;
  const y2 = link.target.y + link.target.height / 2;
  const cx = x1 + (x2 - x1) / 2;
  return `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`;
}
