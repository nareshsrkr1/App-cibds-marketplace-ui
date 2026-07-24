// One-off tool (not part of the app build/runtime). Extracts the Logical Model /
// Glossary / Lineage data literals out of the HTML design source-of-truth and emits
// them as JSON fixtures under src/mocks/workspace/catalogue/. Run manually:
//   node scripts/extract-catalogue-fixtures.mjs "<path-to-CIBD_Updated.html>"
//
// Rather than regex-parsing or eval()-ing the page's whole inline <script> (which also
// contains DOM-touching app logic), this pulls out just the handful of `const NAME = <literal>`
// statements it needs by tracking brace/bracket/string depth to find each statement's exact
// boundaries, then evaluates ONLY that literal via Node's vm module — real JS object/array
// semantics (nested braces, commas, escaped strings), no DOM stubbing required since a plain
// literal never references document/window.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const htmlPath = process.argv[2];
if (!htmlPath) {
  console.error('Usage: node scripts/extract-catalogue-fixtures.mjs <path-to-CIBD_Updated.html>');
  process.exit(1);
}

const html = readFileSync(htmlPath, 'utf8');

/** Finds `const NAME=<literal>;` and returns the literal's source text (from `=` to the matching top-level `;`). */
function extractLiteralSource(source, name) {
  const declRe = new RegExp(`const\\s+${name}\\s*=`);
  const m = declRe.exec(source);
  if (!m) throw new Error(`Could not find declaration for ${name}`);
  let i = m.index + m[0].length;
  const start = i;
  let depth = 0;
  let inString = null; // "'" | '"' | '`' | null
  for (; i < source.length; i++) {
    const ch = source[i];
    if (inString) {
      if (ch === '\\') {
        i++; // skip escaped char
        continue;
      }
      if (ch === inString) inString = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inString = ch;
      continue;
    }
    if (ch === '{' || ch === '[' || ch === '(') depth++;
    else if (ch === '}' || ch === ']' || ch === ')') depth--;
    else if (ch === ';' && depth === 0) break;
  }
  return source.slice(start, i);
}

function extractLiteral(name) {
  const src = extractLiteralSource(html, name);
  const script = new vm.Script(`(${src})`);
  return script.runInNewContext({});
}

const REGISTRY = extractLiteral('REGISTRY');
const BDE_REC = extractLiteral('BDE_REC');
const LINEAGE = extractLiteral('LINEAGE');
const LD2BDES = extractLiteral('LD2BDES');

console.log(
  `Extracted: REGISTRY(${Object.keys(REGISTRY).length} SORs), BDE_REC(${Object.keys(BDE_REC).length} BDEs), ` +
    `LINEAGE(${Object.keys(LINEAGE).length} keys), LD2BDES(${Object.keys(LD2BDES).length} logical datasets)`,
);

// ---- Subject areas (level 0) — grouped from BDE_REC's `sa` field ----
const subjectAreaMap = new Map();
for (const [bdeName, rec] of Object.entries(BDE_REC)) {
  const sa = rec.sa ?? 'Unclassified';
  if (!subjectAreaMap.has(sa)) {
    subjectAreaMap.set(sa, {
      id: slug(sa),
      label: sa,
      domain: rec.domain ?? '',
      subDomain: rec.sd ?? '',
      logicalDatasetNames: new Set(),
      bdeCount: 0,
      realisedCount: 0,
      statuses: [],
    });
  }
  const area = subjectAreaMap.get(sa);
  if (rec.ld) area.logicalDatasetNames.add(rec.ld);
  area.bdeCount += 1;
  area.realisedCount += rec.nPde ?? 0;
  area.statuses.push(rec.status ?? 'Proposed');
  void bdeName;
}

const subjectAreas = [...subjectAreaMap.values()].map((area) => ({
  id: area.id,
  label: area.label,
  domain: area.domain,
  subDomain: area.subDomain,
  logicalDatasetCount: area.logicalDatasetNames.size,
  bdeCount: area.bdeCount,
  realisedCount: area.realisedCount,
  status: area.statuses.every((s) => s === 'Endorsed') ? 'Endorsed' : 'Proposed',
}));

// ---- Logical datasets (level 1) — from LD2BDES, subject area resolved via member BDEs ----
const logicalDatasets = Object.entries(LD2BDES).map(([ldName, bdeNames]) => {
  const firstBde = BDE_REC[bdeNames[0]];
  const pdeCount = bdeNames.reduce((sum, n) => sum + (BDE_REC[n]?.nPde ?? 0), 0);
  return {
    id: slug(ldName),
    name: ldName,
    subjectAreaId: firstBde ? slug(firstBde.sa ?? 'Unclassified') : 'unclassified',
    bdeNames,
    bdeCount: bdeNames.length,
    pdeCount,
  };
});

// ---- Business Data Elements (level 2) — straight from BDE_REC, plus realizing dataset/columns from LINEAGE ----
const businessElements = Object.entries(BDE_REC).map(([name, rec]) => {
  const lineage = LINEAGE[name];
  const realizations = lineage
    ? Object.entries(lineage.datasets ?? {}).map(([dsName, ds]) => ({
        datasetName: dsName,
        sor: ds.sor,
        columns: (ds.cols ?? []).map((c) => c.col),
      }))
    : [];
  return {
    id: rec.id,
    name,
    definition: rec.def ?? '',
    domain: rec.domain ?? '',
    subDomain: rec.sd ?? '',
    subjectAreaId: slug(rec.sa ?? 'Unclassified'),
    logicalDatasetId: slug(rec.ld ?? ''),
    logicalDatasetName: rec.ld ?? '',
    classification: rec.cls ?? 'Internal',
    pii: rec.pii === 'Yes',
    representation: rec.rep ?? '',
    isCde: Boolean(rec.cde),
    status: rec.status ?? 'Proposed',
    steward: rec.steward ?? '',
    pdeCount: rec.nPde ?? 0,
    datasetCount: rec.nDs ?? realizations.length,
    realizations,
  };
});

// ---- Glossary terms — derived from the same BDE_REC canonical record (this SoT's own sample
// data shows a 1:1 term<->BDE rollup in every case shown) ----
const glossaryTerms = businessElements.map((bde) => ({
  id: bde.id,
  name: bde.name,
  definition: bde.definition,
  subjectAreaId: bde.subjectAreaId,
  classification: bde.classification,
  pii: bde.pii,
  status: bde.status,
  pdeCount: bde.pdeCount,
  bdeIds: [bde.id],
}));

// ---- Lineage: split into a lightweight summary (renders the Sankey diagram) and a details
// payload (per-column type/nullable/etc., only read after a user clicks a node) ----
const lineageSummary = [];
const lineageDetails = [];
for (const [key, entry] of Object.entries(LINEAGE)) {
  const datasetBreakdown = Object.entries(entry.datasets ?? {}).map(([dsName, ds]) => ({
    datasetName: dsName,
    sor: ds.sor,
    columnCount: (ds.cols ?? []).length,
  }));
  const columnCount = datasetBreakdown.reduce((sum, d) => sum + d.columnCount, 0);
  lineageSummary.push({
    key,
    term: entry.term ?? key,
    bdeName: entry.term ?? key,
    bdeId: entry.bde ?? '',
    logicalDatasetName: entry.ld ?? '',
    datasets: datasetBreakdown,
    columnCount,
  });
  lineageDetails.push({
    key,
    term: entry.term ?? key,
    bdeId: entry.bde ?? '',
    subjectArea: entry.sa ?? '',
    // The SoT's own LINEAGE object mislabels this field `domain` — its values are actually
    // sub-domain level (e.g. "Trading Data"), matching BDE_REC's `sd` field for the same BDE.
    subDomain: entry.domain ?? '',
    classification: entry.cls ?? 'Internal',
    pii: entry.pii === 'Yes',
    status: entry.status ?? 'Proposed',
    definition: entry.def ?? '',
    logicalDatasetName: entry.ld ?? '',
    datasets: Object.entries(entry.datasets ?? {}).map(([dsName, ds]) => ({
      datasetName: dsName,
      sor: ds.sor,
      columns: (ds.cols ?? []).map((c) => ({
        name: c.col,
        type: c.type,
        nullable: c.nullable === 'Yes',
      })),
    })),
  });
}

function slug(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const outDir = join(__dirname, '..', 'src', 'mocks', 'workspace', 'catalogue');
mkdirSync(outDir, { recursive: true });

function write(fileName, data) {
  writeFileSync(join(outDir, fileName), JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${fileName}`);
}

write('logical-model.json', { subjectAreas, logicalDatasets });
write('business-elements.json', { elements: businessElements });
write('glossary-terms.json', { terms: glossaryTerms });
write('lineage-summary.json', { entries: lineageSummary });
write('lineage-details.json', { entries: lineageDetails });

console.log(
  `\nCounts — subjectAreas:${subjectAreas.length} logicalDatasets:${logicalDatasets.length} ` +
    `businessElements:${businessElements.length} glossaryTerms:${glossaryTerms.length} lineageEntries:${lineageSummary.length}`,
);
