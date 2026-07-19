import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { resetAppConfig } from '../app/config/appConfig';
import { setLandingMockScenario } from '../mocks/landing/handlers';
import {
  setConsoleMockScenario,
  setSessionMockScenario,
} from '../mocks/workspace/handlers';
import { server } from '../mocks/landing/server';

beforeAll(() => {
  resetAppConfig();
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  resetAppConfig();
  setLandingMockScenario('success');
  setSessionMockScenario('success');
  setConsoleMockScenario('success');
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
