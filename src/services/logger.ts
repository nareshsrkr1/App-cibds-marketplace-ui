/**
 * Thin logging seam. Everything funnels through here instead of calling
 * `console.*` directly, so swapping in a real telemetry/error-reporting
 * backend (e.g. Sentry, App Insights) later is a one-file change.
 */
export type LogContext = Record<string, unknown> | unknown;

function write(
  method: 'info' | 'warn' | 'error',
  message: string,
  context?: LogContext,
): void {
  const fn = console[method];
  if (context !== undefined) fn(`[app] ${message}`, context);
  else fn(`[app] ${message}`);
}

export const logger = {
  info: (message: string, context?: LogContext) => write('info', message, context),
  warn: (message: string, context?: LogContext) => write('warn', message, context),
  error: (message: string, context?: LogContext) => write('error', message, context),
};
