import * as Sentry from "@sentry/node";
import { env } from "./config/env.js";

let sentryEnabled = false;

export function initMonitoring() {
  if (!env.sentryDsn) {
    return;
  }

  Sentry.init({
    dsn: env.sentryDsn,
    environment: env.nodeEnv,
    tracesSampleRate: env.sentryTracesSampleRate,
  });
  sentryEnabled = true;
}

export function captureException(error: unknown) {
  if (sentryEnabled) {
    Sentry.captureException(error);
  }
}
