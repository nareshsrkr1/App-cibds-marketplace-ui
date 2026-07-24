import { startTransition, useEffect, useRef, useState } from 'react';
import type { SectionStatus } from './components/ProducerConsole';
import type { NavGroup } from './nav.types';
import {
  fetchConsoleCharts,
  fetchConsoleConsumers,
  fetchConsoleGovernance,
  fetchConsoleHero,
  fetchConsoleSubscriptionRequests,
  fetchWorkspaceNav,
} from './workspace.api';
import type {
  ConsoleChart,
  ConsoleChartTier,
  ConsoleHero,
  ConsolePanel,
} from './workspace.types';

export type ConsoleData = {
  navGroups: NavGroup[];
  navStatus: 'loading' | 'ready' | 'error';
  navRefreshing: boolean;

  hero: ConsoleHero | null;
  heroStatus: SectionStatus;
  heroError: string | null;

  charts: ConsoleChart[];
  chartTiers: ConsoleChartTier[];
  chartsStatus: SectionStatus;
  chartsError: string | null;

  primaryPanel: ConsolePanel | null;
  primaryStatus: SectionStatus;
  primaryError: string | null;
  primaryTitle: string;

  secondaryPanel: ConsolePanel | null;
  secondaryStatus: SectionStatus;
  secondaryError: string | null;
  secondaryTitle: string;

  /** Drives the soft charts/panels re-enter animation on persona switch. */
  bodyStageClass: 'is-enter' | '';
  /** True once the hero has successfully loaded at least once. */
  hydrated: boolean;
};

function isHeroReady(data: ConsoleHero): boolean {
  return (data.kpis?.length ?? 0) > 0 || (data.actions?.length ?? 0) > 0;
}

function panelReady(panel: ConsolePanel | null): SectionStatus {
  return (panel?.items?.length ?? 0) > 0 ? 'ready' : 'empty';
}

/**
 * Loads nav/hero/charts/panels for the active persona and re-fetches whenever
 * `persona` or `reloadToken` changes. Kept out of `WorkspacePage` so the page
 * component stays focused on layout/composition rather than data fetching.
 */
export function useConsoleData(
  persona: string,
  sessionReady: boolean,
  reloadToken: number,
): ConsoleData {
  const [navGroups, setNavGroups] = useState<NavGroup[]>([]);
  const [navStatus, setNavStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [navRefreshing, setNavRefreshing] = useState(false);

  const [hero, setHero] = useState<ConsoleHero | null>(null);
  const [heroStatus, setHeroStatus] = useState<SectionStatus>('loading');
  const [heroError, setHeroError] = useState<string | null>(null);

  const [charts, setCharts] = useState<ConsoleChart[]>([]);
  const [chartTiers, setChartTiers] = useState<ConsoleChartTier[]>([]);
  const [chartsStatus, setChartsStatus] = useState<SectionStatus>('loading');
  const [chartsError, setChartsError] = useState<string | null>(null);

  const [primaryPanel, setPrimaryPanel] = useState<ConsolePanel | null>(null);
  const [primaryStatus, setPrimaryStatus] = useState<SectionStatus>('loading');
  const [primaryError, setPrimaryError] = useState<string | null>(null);
  const [primaryTitle, setPrimaryTitle] = useState('Panel');

  const [secondaryPanel, setSecondaryPanel] = useState<ConsolePanel | null>(null);
  const [secondaryStatus, setSecondaryStatus] = useState<SectionStatus>('loading');
  const [secondaryError, setSecondaryError] = useState<string | null>(null);
  const [secondaryTitle, setSecondaryTitle] = useState('Panel');

  const [bodyStageClass, setBodyStageClass] = useState<'is-enter' | ''>('');
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (!sessionReady) return;
    let cancelled = false;
    const p = persona.toUpperCase();

    setNavRefreshing(hydratedRef.current);
    if (!hydratedRef.current) {
      setNavStatus('loading');
      setHeroStatus('loading');
    } else {
      // Keep greeting/hero/KPIs/actions on screen; only refresh charts + panels.
      setChartsStatus('loading');
      setPrimaryStatus('loading');
      setSecondaryStatus('loading');
      setCharts([]);
      setChartTiers([]);
      setPrimaryPanel(null);
      setSecondaryPanel(null);
      setBodyStageClass('');
    }

    setHeroError(null);
    setChartsError(null);
    setPrimaryError(null);
    setSecondaryError(null);

    void fetchWorkspaceNav(persona).then((res) => {
      if (cancelled) return;
      if (!res.ok) {
        setNavStatus('error');
        setNavGroups([]);
        setNavRefreshing(false);
        return;
      }
      setNavGroups(res.data.groups ?? []);
      setNavStatus('ready');
      setNavRefreshing(false);
    });

    void fetchConsoleHero(persona).then((res) => {
      if (cancelled) return;
      if (!res.ok) {
        setHeroStatus('error');
        setHeroError(res.error);
        if (!hydratedRef.current) setHero(null);
        return;
      }
      setHero(res.data);
      setHeroStatus(isHeroReady(res.data) ? 'ready' : 'empty');
      hydratedRef.current = true;
    });

    void fetchConsoleCharts(persona).then((res) => {
      if (cancelled) return;
      startTransition(() => {
        if (!res.ok) {
          setChartsStatus('error');
          setChartsError(res.error);
          setCharts([]);
          setChartTiers([]);
          if (hydratedRef.current) setBodyStageClass('is-enter');
          return;
        }
        setCharts(res.data.charts ?? []);
        setChartTiers(res.data.tiers ?? []);
        setChartsStatus((res.data.charts?.length ?? 0) > 0 ? 'ready' : 'empty');
        if (hydratedRef.current) setBodyStageClass('is-enter');
      });
    });

    if (p === 'PRODUCER') {
      setPrimaryTitle('My consumers · last delivery & SLA');
      setSecondaryTitle('Subscription requests · awaiting your approval');
      void fetchConsoleConsumers(persona).then((res) => {
        if (cancelled) return;
        startTransition(() => {
          if (!res.ok) {
            setPrimaryStatus('error');
            setPrimaryError(res.error);
            return;
          }
          setPrimaryPanel(res.data.panel);
          setPrimaryStatus(panelReady(res.data.panel));
        });
      });
      void fetchConsoleSubscriptionRequests(persona).then((res) => {
        if (cancelled) return;
        startTransition(() => {
          if (!res.ok) {
            setSecondaryStatus('error');
            setSecondaryError(res.error);
            return;
          }
          setSecondaryPanel(res.data.panel);
          setSecondaryStatus(panelReady(res.data.panel));
        });
      });
    } else if (p === 'GOVERNANCE') {
      setPrimaryTitle('Endorsement queue');
      setSecondaryStatus('empty');
      setSecondaryPanel(null);
      void fetchConsoleGovernance(persona).then((res) => {
        if (cancelled) return;
        startTransition(() => {
          if (!res.ok) {
            setPrimaryStatus('error');
            setPrimaryError(res.error);
            return;
          }
          setPrimaryPanel(res.data.panel);
          setPrimaryStatus(panelReady(res.data.panel));
        });
      });
    } else {
      setPrimaryPanel(null);
      setSecondaryPanel(null);
      setPrimaryStatus('empty');
      setSecondaryStatus('empty');
    }

    return () => {
      cancelled = true;
    };
  }, [sessionReady, persona, reloadToken]);

  return {
    navGroups,
    navStatus,
    navRefreshing,
    hero,
    heroStatus,
    heroError,
    charts,
    chartTiers,
    chartsStatus,
    chartsError,
    primaryPanel,
    primaryStatus,
    primaryError,
    primaryTitle,
    secondaryPanel,
    secondaryStatus,
    secondaryError,
    secondaryTitle,
    bodyStageClass,
    hydrated: hydratedRef.current,
  };
}
