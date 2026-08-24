/**
 * Runs once when the server process boots. Without it the realtime poller
 * only starts on the first API request, so the first users after a deploy get
 * the degraded banner and timetable numbers until the first cycle lands.
 */

export async function register(): Promise<void> {
  // register() also runs on the edge runtime, where the poller cannot live.
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  try {
    const { startPoller } = await import("./lib/realtime");
    startPoller();
  } catch (cause) {
    // A dead poller must never stop the server from booting.
    console.error("[instrumentation] avvio del poller realtime fallito", cause);
  }
}
