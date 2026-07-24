/**
 * Marketplace API surface (contracts + helpers).
 *
 * Feature modules under src/features call these endpoints via httpClient.
 * Mock implementations live under src/api/mock (handlers) + src/mocks (JSON
 * fixtures) and intercept the same paths when the resource mode is mock.
 */
export {
  API_ENDPOINTS,
  listPlannedEndpoints,
  listWiredEndpoints,
  withPersonaQuery,
  type ApiEndpointDef,
  type ApiEndpointKey,
} from './endpoints';
