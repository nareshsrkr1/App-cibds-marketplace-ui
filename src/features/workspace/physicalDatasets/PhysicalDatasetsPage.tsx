import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { isFeatureEnabled } from '../../../app/config/featureFlags';
import { ConsoleHeader } from '../components/ConsoleHeader';
import { CatalogueModalsProvider } from '../lineage/CatalogueModalsProvider';
import { GlossaryTermsTab } from '../glossary/components/GlossaryTermsTab';
import { LogicalModelTab } from '../logicalModel/components/LogicalModelTab';
import { WORKSPACE_ROUTES } from '../workspaceRoutes';
import { PhysicalDatasetsTab } from './components/PhysicalDatasetsTab';
import './physicalDatasets.css';

const FUTURE = 'Available in a future release';

type CatalogueTab = 'phys' | 'log' | 'bt';

const TABS: Array<{ id: CatalogueTab; label: string }> = [
  { id: 'phys', label: 'Physical Datasets' },
  { id: 'log', label: 'Logical Model' },
  { id: 'bt', label: 'Glossary Terms' },
];

/** Matches the route's optional `:tab` param (from `physical-datasets/:tab?` in
 * App.tsx) to which tab that is — the left nav's "Logical model"/"Glossary terms"
 * deep-link to these same sub-paths, so a direct nav click or a bookmarked/shared
 * URL lands on the right tab instead of always opening on Physical Datasets. */
function tabForParam(tab: string | undefined): CatalogueTab {
  if (tab === 'logical-model') return 'log';
  if (tab === 'glossary-terms') return 'bt';
  return 'phys';
}

export function PhysicalDatasetsPage() {
  const params = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const initialTab = tabForParam(params.tab);

  const [activeTab, setActiveTab] = useState<CatalogueTab>(initialTab);
  // Tabs stay mounted (hidden, not unmounted) once visited, so their own fetch only
  // runs on first activation and switching back doesn't re-fetch.
  const [visitedTabs, setVisitedTabs] = useState<Set<CatalogueTab>>(() => new Set([initialTab]));

  // A left-nav click (or browser back/forward) changes the `:tab` param without
  // unmounting this page (single Route match) — sync activeTab to match.
  useEffect(() => {
    const tab = tabForParam(params.tab);
    setActiveTab(tab);
    setVisitedTabs((prev) => (prev.has(tab) ? prev : new Set(prev).add(tab)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.tab]);

  function selectTab(tab: CatalogueTab) {
    if (!isFeatureEnabled(tab)) return;
    navigate(WORKSPACE_ROUTES[tab], { replace: true });
  }

  return (
    <div className="pdc" data-testid="physical-datasets">
      <ConsoleHeader
        eyebrow="CIB Data Marketplace"
        greeting="Discover the firm's data."
        subtitle="Three connected layers — the physical datasets harvested from source systems, the logical model that organises them, and the business glossary that names them. Every entry traces to where it comes from and how it is governed."
      />

      <div className="pdc-tabs" role="tablist" aria-label="Catalogue">
        {TABS.map((tab) => {
          const enabled = isFeatureEnabled(tab.id);
          return (
            <button
              key={tab.id}
              type="button"
              className={`pdc-tab${activeTab === tab.id ? ' is-active' : ''}${enabled ? '' : ' is-disabled'}`}
              role="tab"
              aria-selected={activeTab === tab.id}
              disabled={!enabled}
              title={enabled ? undefined : FUTURE}
              onClick={() => selectTab(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Each tab fetches its own data lazily on first activation — switching tabs never
          triggers all three tabs' network requests at once — and stays mounted (hidden,
          not unmounted) once visited so switching back doesn't re-fetch. */}
      <CatalogueModalsProvider>
        {visitedTabs.has('phys') ? (
          <div hidden={activeTab !== 'phys'}>
            <PhysicalDatasetsTab />
          </div>
        ) : null}
        {visitedTabs.has('log') ? (
          <div hidden={activeTab !== 'log'}>
            <LogicalModelTab />
          </div>
        ) : null}
        {visitedTabs.has('bt') ? (
          <div hidden={activeTab !== 'bt'}>
            <GlossaryTermsTab />
          </div>
        ) : null}
      </CatalogueModalsProvider>
    </div>
  );
}
