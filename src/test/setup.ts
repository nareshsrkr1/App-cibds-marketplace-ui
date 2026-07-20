import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { resetAppConfig } from '../app/config/appConfig';
import { setLandingMockScenario } from '../mocks/landing/handlers';
import { setMockResponseDelay } from '../mocks/mockDelay';
import {
  setConsoleMockScenario,
  setSessionMockScenario,
} from '../mocks/workspace/handlers';
import { server } from '../mocks/landing/server';

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
