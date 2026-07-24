/**
 * Artificial latency for MSW mock responses (ms).
 * Keep at 0 for normal local use. Set temporarily (e.g. 2000) only when
 * you want to demo the workspace loading spinner.
 *
 * Location: src/api/mock/mockDelay.ts
 */
export const MOCK_RESPONSE_DELAY_MS = 0;

let delayMs = MOCK_RESPONSE_DELAY_MS;

export function getMockResponseDelay(): number {
  return delayMs;
}

/** Override for tests or a one-off demo. */
export function setMockResponseDelay(ms: number) {
  delayMs = ms;
}

export function resetMockResponseDelay() {
  delayMs = MOCK_RESPONSE_DELAY_MS;
}
