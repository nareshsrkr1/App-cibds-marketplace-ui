import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { setLandingMockScenario } from '../mocks/landing/handlers';
import { server } from '../mocks/landing/server';

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  setLandingMockScenario('success');
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
