import { setupWorker } from 'msw/browser';
import { catalogueHandlers } from './handlers/catalogue.handlers';
import { landingHandlers } from './handlers/landing.handlers';
import { workspaceHandlers } from './handlers/workspace.handlers';

export const worker = setupWorker(...landingHandlers, ...workspaceHandlers, ...catalogueHandlers);

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

/**
 * Re-registers the mock worker if the page has lost its Service Worker
 * controller — browsers terminate idle Service Workers (~30s of inactivity)
 * to save resources, and a fetch made before it re-activates bypasses MSW
 * entirely, hitting the static preview/dev server as a bare 404. No-op if
 * the worker is already controlling the page.
 */
export async function ensureMockWorkerActive(): Promise<void> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  if (navigator.serviceWorker.controller) return;
  startPromise = null; // force a fresh start() even though we started successfully before
  await startMockWorker();
}
