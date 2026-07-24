import { useOutletContext } from 'react-router-dom';
import { EmptyState } from '../../components/feedback/EmptyState/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState/ErrorState';
import { ConsoleSkeleton } from './components/ConsoleSkeleton';
import { ProducerConsole } from './components/ProducerConsole';
import type { WorkspaceOutletContext } from './WorkspacePage';

export function WorkspaceConsolePage() {
  const { data, reloadConsole, onAction } = useOutletContext<WorkspaceOutletContext>();

  const showInitialSpinner = data.heroStatus === 'loading' && !data.hydrated;

  return (
    <>
      {showInitialSpinner && (
        <div role="status" aria-label="Loading">
          <ConsoleSkeleton />
        </div>
      )}
      {data.heroStatus === 'error' && !data.hero && (
        <div className="workspace-state workspace-state--main">
          <ErrorState
            title="Unable to load console"
            description={data.heroError ?? 'Console hero is unavailable.'}
            onRetry={reloadConsole}
          />
        </div>
      )}
      {data.heroStatus === 'empty' && data.hero && (
        <div className="workspace-state workspace-state--main">
          <EmptyState
            title={data.hero.greeting ?? 'No console data'}
            description={
              data.hero.subtitle ?? 'There is nothing to show for this persona yet.'
            }
          />
        </div>
      )}
      {data.hero && data.heroStatus === 'ready' ? (
        <ProducerConsole
          hero={data.hero}
          charts={data.charts}
          chartTiers={data.chartTiers}
          chartsStatus={data.chartsStatus}
          chartsError={data.chartsError}
          primaryPanel={data.primaryPanel}
          primaryStatus={data.primaryStatus}
          primaryError={data.primaryError}
          primaryEmptyTitle={data.primaryTitle}
          secondaryPanel={data.secondaryPanel}
          secondaryStatus={data.secondaryStatus}
          secondaryError={data.secondaryError}
          secondaryEmptyTitle={data.secondaryTitle}
          bodyStageClass={data.bodyStageClass}
          onAction={onAction}
        />
      ) : null}
    </>
  );
}
