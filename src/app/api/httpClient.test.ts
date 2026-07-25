import { afterEach, describe, expect, it, vi } from 'vitest';
import { resetAppConfig, setAppConfig } from '../config/appConfig';
import { httpGet } from './httpClient';

vi.mock('../../api/mock/browser', () => ({
  ensureMockWorkerActive: vi.fn().mockResolvedValue(undefined),
}));

function setServiceWorkerController(controller: object | null) {
  Object.defineProperty(navigator, 'serviceWorker', {
    value: { controller },
    configurable: true,
  });
}

describe('httpGet — stale mock-worker recovery', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    resetAppConfig();
    global.fetch = originalFetch;
    vi.clearAllMocks();
  });

  it('retries once and recovers when a mock-mode GET 404s with no SW controller', async () => {
    setAppConfig({
      api: { defaultMode: 'mock', baseUrl: '', resources: { datasets: { mode: 'mock' } } },
    });
    setServiceWorkerController(null);

    let calls = 0;
    global.fetch = vi.fn().mockImplementation(() => {
      calls += 1;
      if (calls === 1) return Promise.resolve(new Response('', { status: 404 }));
      return Promise.resolve(new Response(JSON.stringify({ hello: 'world' }), { status: 200 }));
    }) as unknown as typeof fetch;

    const result = await httpGet<{ hello: string }>('/api/v1/datasets-recovery-test', {
      resource: 'datasets',
    });

    expect(calls).toBe(2);
    expect(result).toEqual({ ok: true, data: { hello: 'world' } });

    const { ensureMockWorkerActive } = await import('../../api/mock/browser');
    expect(ensureMockWorkerActive).toHaveBeenCalledTimes(1);
  });

  it('does not retry when the SW controller is already present', async () => {
    setAppConfig({
      api: { defaultMode: 'mock', baseUrl: '', resources: { datasets: { mode: 'mock' } } },
    });
    setServiceWorkerController({});

    let calls = 0;
    global.fetch = vi.fn().mockImplementation(() => {
      calls += 1;
      return Promise.resolve(new Response('', { status: 404 }));
    }) as unknown as typeof fetch;

    const result = await httpGet('/api/v1/datasets-no-retry-controller', { resource: 'datasets' });

    expect(calls).toBe(1);
    expect(result.ok).toBe(false);
    const { ensureMockWorkerActive } = await import('../../api/mock/browser');
    expect(ensureMockWorkerActive).not.toHaveBeenCalled();
  });

  it('does not retry for a real-mode resource', async () => {
    setAppConfig({
      api: {
        defaultMode: 'real',
        baseUrl: 'https://api.example.com',
        resources: { datasets: { mode: 'real' } },
      },
    });
    setServiceWorkerController(null);

    let calls = 0;
    global.fetch = vi.fn().mockImplementation(() => {
      calls += 1;
      return Promise.resolve(new Response('', { status: 404 }));
    }) as unknown as typeof fetch;

    const result = await httpGet('/api/v1/datasets-no-retry-real', { resource: 'datasets' });

    expect(calls).toBe(1);
    expect(result.ok).toBe(false);
    const { ensureMockWorkerActive } = await import('../../api/mock/browser');
    expect(ensureMockWorkerActive).not.toHaveBeenCalled();
  });

  it('does not retry a non-404 failure', async () => {
    setAppConfig({
      api: { defaultMode: 'mock', baseUrl: '', resources: { datasets: { mode: 'mock' } } },
    });
    setServiceWorkerController(null);

    let calls = 0;
    global.fetch = vi.fn().mockImplementation(() => {
      calls += 1;
      return Promise.resolve(new Response('', { status: 500 }));
    }) as unknown as typeof fetch;

    const result = await httpGet('/api/v1/datasets-no-retry-500', { resource: 'datasets' });

    expect(calls).toBe(1);
    expect(result.ok).toBe(false);
  });
});
