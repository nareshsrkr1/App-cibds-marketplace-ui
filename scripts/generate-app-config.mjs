import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const localProps = path.join(root, 'config', 'env-local.properties');
const exampleProps = path.join(root, 'config', 'env-local.properties.example');
const outFile = path.join(root, 'public', 'app-config.json');

/** Map PROPERTY_NAME → app-config resource id */
const RESOURCE_MODE_KEYS = {
  LANDING_METRICS_MODE: 'landingMetrics',
  SESSION_CONTEXT_MODE: 'sessionContext',
  WORKSPACE_CONSOLE_HERO_MODE: 'workspaceConsoleHero',
  WORKSPACE_CONSOLE_CHARTS_MODE: 'workspaceConsoleCharts',
  WORKSPACE_CONSOLE_SUB_REQUESTS_MODE: 'workspaceConsoleSubRequests',
  WORKSPACE_CONSOLE_GOVERNANCE_MODE: 'workspaceConsoleGovernance',
  NOTIFICATIONS_MODE: 'notifications',
  DATASETS_MODE: 'datasets',
  BUSINESS_TERMS_MODE: 'businessTerms',
  GOVERNANCE_MODE: 'governance',
  SEARCH_MODE: 'search',
};

function parseProperties(text) {
  const props = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 0) continue;
    props[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
  }
  return props;
}

function asMode(value) {
  return value === 'mock' || value === 'real' ? value : undefined;
}

const source = fs.existsSync(localProps) ? localProps : exampleProps;
if (!fs.existsSync(source)) {
  console.error('No config/env-local.properties or .example found');
  process.exit(1);
}

const props = parseProperties(fs.readFileSync(source, 'utf8'));

// Prefer API_DEFAULT_MODE; fall back to legacy API_MODE
const defaultMode =
  asMode(props.API_DEFAULT_MODE) ?? asMode(props.API_MODE) ?? 'mock';

const resources = {};
for (const [propKey, resourceId] of Object.entries(RESOURCE_MODE_KEYS)) {
  const mode = asMode(props[propKey]);
  if (mode) resources[resourceId] = { mode };
}

const config = {
  api: {
    defaultMode,
    baseUrl: props.API_BASE_URL ?? '',
    resources,
  },
};

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, `${JSON.stringify(config, null, 2)}\n`, 'utf8');
console.log(`Wrote ${path.relative(root, outFile)} from ${path.relative(root, source)}`);
