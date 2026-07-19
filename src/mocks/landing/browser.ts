import { setupWorker } from 'msw/browser';
import { landingHandlers } from './handlers';
import { workspaceHandlers } from '../workspace/handlers';

export const worker = setupWorker(...landingHandlers, ...workspaceHandlers);

let startPromise: Promise<void> | null = null;

export async function startMockWorker() {
  if (startPromise) return startPromise;

  startPromise = worker
    .start({
      onUnhandledRequest: 'bypass',
      quiet: true,
    })
    .then(() => undefined)
    .catch((error: unknown) => {
      // Allow a later retry after a failed start (e.g. SW update race).
      startPromise = null;
      throw error;
    });

  return startPromise;
}
