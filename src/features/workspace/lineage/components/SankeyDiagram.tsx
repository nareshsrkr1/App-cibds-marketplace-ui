import { useMemo } from 'react';
import { layoutSankey, sankeyLinkPath, type PositionedSankeyNode, type SankeyData } from '../lineage.sankey';

export type SankeyDiagramProps = {
  data: SankeyData;
  selectedNodeId: string | null;
  onSelectNode: (node: PositionedSankeyNode) => void;
};

const CHARS_PER_LINE = 20;

const TIER_CAPTION: Record<PositionedSankeyNode['kind'], string> = {
  root: 'Term',
  bde: 'Business element',
  dataset: 'Dataset',
  columns: 'Columns',
};

const TIER_FILL: Record<PositionedSankeyNode['kind'], string> = {
  root: 'var(--color-brand)',
  bde: 'var(--gold-deep)',
  dataset: 'var(--blue)',
  columns: 'var(--green)',
};

function truncate(label: string, max: number): string {
  return label.length > max ? `${label.slice(0, max - 1)}…` : label;
}

export function SankeyDiagram({ data, selectedNodeId, onSelectNode }: SankeyDiagramProps) {
  const layout = useMemo(() => layoutSankey(data), [data]);

  return (
    <svg
      className="lin-svg"
      width={layout.width}
      height={layout.height}
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      role="img"
      aria-label={`Lineage diagram for ${data.rootLabel}`}
      preserveAspectRatio="xMinYMin meet"
    >
      <g className="lin-ribbons">
        {layout.links.map((link, i) => (
          <path
            key={i}
            d={sankeyLinkPath(link)}
            className="lin-ribbon"
            stroke={TIER_FILL[link.source.kind]}
            strokeWidth={link.strokeWidth}
            fill="none"
          />
        ))}
      </g>
      {layout.nodes.map((node) => {
        const isSelected = node.id === selectedNodeId;
        const hasSublabel = Boolean(node.sublabel);
        return (
          <g
            key={node.id}
            transform={`translate(${node.x}, ${node.y})`}
            className={`lin-node${isSelected ? ' is-selected' : ''}`}
            role="button"
            tabIndex={0}
            aria-label={`${TIER_CAPTION[node.kind]}: ${node.label}`}
            aria-pressed={isSelected}
            onClick={() => onSelectNode(node)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectNode(node);
              }
            }}
          >
            <title>{`${TIER_CAPTION[node.kind]}: ${node.label}${node.sublabel ? ` (${node.sublabel})` : ''}`}</title>
            <rect width={node.width} height={node.height} rx={6} fill={TIER_FILL[node.kind]} />
            <text x={10} y={16} className="lin-node-caption">
              {TIER_CAPTION[node.kind]}
            </text>
            <text x={10} y={hasSublabel ? 34 : 44} className="lin-node-label">
              {truncate(node.label, CHARS_PER_LINE)}
            </text>
            {hasSublabel ? (
              <text x={10} y={50} className="lin-node-sublabel">
                {truncate(node.sublabel ?? '', CHARS_PER_LINE)}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
