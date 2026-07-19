import { setupWorker } from 'msw/browser';
import { landingHandlers } from './handlers';

export const worker = setupWorker(...landingHandlers);

export async function startMockWorker() {
  await worker.start({
    onUnhandledRequest: 'bypass',
    quiet: true,
  });
}
