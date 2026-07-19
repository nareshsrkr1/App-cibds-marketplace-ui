import { setAppConfig, type AppConfig } from './appConfig';

/**
 * Loads runtime config from a static JSON file (not Vite env).
 * Deployments can replace public/app-config.json without rebuilding the bundle.
 */
export async function loadAppConfig(
  url = '/app-config.json',
): Promise<AppConfig> {
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to load app config (${response.status})`);
    }
    const data = await response.json();
    return setAppConfig(data);
  } catch {
    return setAppConfig({
      api: { defaultMode: 'mock', baseUrl: '', resources: {} },
    });
  }
}
