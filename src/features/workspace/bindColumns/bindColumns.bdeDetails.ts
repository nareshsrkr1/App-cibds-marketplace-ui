import type { BindBdeDetail } from './bindColumns.types';
import details from '../../../mocks/workspace/producer/bind-columns/bde-details.json';

export const BDE_DETAILS = details as Record<string, BindBdeDetail>;

export function bdeIdFromLabel(label: string): string {
  const m = label.match(/\(([^)]+)\)/);
  return m?.[1] ?? label;
}

export function isAmountColumn(col: string, type: string): boolean {
  return /DECIMAL|NUMERIC|amount|notional|price|rate|premium|fee|margin|pnl|cost|value/i.test(
    `${col} ${type}`,
  );
}
