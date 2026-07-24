import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { resetAppConfig } from '../app/config/appConfig';
import { setLandingMockScenario } from '../api/mock/handlers/landing.handlers';
import { setMockResponseDelay } from '../api/mock/mockDelay';
import {
  setConsoleMockScenario,
  setSessionMockScenario,
} from '../api/mock/handlers/workspace.handlers';
import { server } from '../api/mock/server';

beforeAll(() => {
  resetAppConfig();
  /** Tests must not wait on the 5s demo delay. */
  setMockResponseDelay(0);
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  resetAppConfig();
  setMockResponseDelay(0);
  setLandingMockScenario('success');
  setSessionMockScenario('success');
  setConsoleMockScenario('success');
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
