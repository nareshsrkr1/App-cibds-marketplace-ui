import type { BindColumn, BindResolvedDataset, BindReviewPath } from '../bindColumns.types';

export type BindReviewProps = {
  resolved: BindResolvedDataset;
  columns: BindColumn[];
  contractName: string;
  reviewPath: BindReviewPath;
  srcType: 's3' | 'other';
};

function methodLabel(m: BindColumn['method']) {
  if (m === 's') return 'suggested';
  if (m === 'p') return 'proposed';
  if (m === 'm') return 'manual';
  return 'none';
}

export function BindReview({
  resolved,
  columns,
  contractName,
  reviewPath,
  srcType,
}: BindReviewProps) {
  const bound = columns.filter((c) => Boolean(c.suggest));
  const lines: string[] = [];
  lines.push('# CIB Data Marketplace — dataset registry contract');
  lines.push(`dataset: ${resolved.name}`);
  lines.push('source:');
  lines.push(`  type: ${srcType === 's3' ? 's3' : 'manual'}`);
  if (srcType === 's3') {
    lines.push(`  path: s3://${resolved.s3Prefix}/`);
    lines.push('  autoHarvest: true');
  }
  lines.push('governance:');
  lines.push(`  classification: ${resolved.classification}`);
  lines.push('distribution:');
  lines.push(`  offer: ${contractName || '—'}`);
  lines.push(`  offerId: ${resolved.offerId}`);
  lines.push(
    `  reviewPath: ${reviewPath === 'steward' ? 'steward-endorsement' : 'self-certify'}`,
  );
  lines.push(`columns: # ${columns.length} harvested`);
  for (const c of columns) {
    lines.push(`  - name: ${c.col}`);
    lines.push(`    type: ${c.type}`);
    if (c.len) lines.push(`    length: ${c.len}`);
    lines.push(`    nullable: ${(c.nul || '').toLowerCase()}`);
    if (c.srcmap) lines.push(`    sourceMapping: ${c.srcmap}`);
    if (c.orig) lines.push(`    origination: ${c.orig}`);
    lines.push(`    pii: ${(c.pii || 'No').toLowerCase()}`);
    if (c.suggest) {
      lines.push(`    boundTo: ${c.suggest}`);
      lines.push(`    bindMethod: ${methodLabel(c.method)}`);
    }
  }
  lines.push('binding:');
  lines.push(`  bound: ${bound.length}`);
  lines.push(`  total: ${columns.length}`);
  lines.push(
    `  coverage: ${columns.length ? Math.round((bound.length / columns.length) * 100) : 0}%`,
  );

  return (
    <div className="sh-block">
      <div className="ok-banner" role="status">
        ✓ Ready to publish. Review the generated dataset contract below.
      </div>
      <pre className="bind-yaml" aria-label="Dataset contract preview">
        {lines.join('\n')}
      </pre>
    </div>
  );
}
