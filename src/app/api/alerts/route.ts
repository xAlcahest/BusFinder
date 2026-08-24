import { failure, jsonOk, optionalId } from "@/app/api/_lib/http";
import { ensurePoller, safeRoutesById, safeSnapshot } from "@/app/api/_lib/rt";
import type { AlertsResponse, RouteSummary, ServiceAlert } from "@/lib/types";

export const dynamic = "force-dynamic";

interface ActivePeriod {
  activeFrom: number | null;
  activeUntil: number | null;
}

/** An open bound means "no start" or "no end", so it never excludes an alert. */
function isActive(alert: ActivePeriod, now: number): boolean {
  if (alert.activeFrom !== null && alert.activeFrom > now) return false;
  if (alert.activeUntil !== null && alert.activeUntil < now) return false;
  return true;
}

export async function GET(request: Request): Promise<Response> {
  try {
    const params = new URL(request.url).searchParams;
    const routeFilter = optionalId(params, "routeId", "routeId");

    ensurePoller();
    const snapshot = safeSnapshot();
    const routes = safeRoutesById();
    const now = Math.floor(Date.now() / 1000);

    const alerts: ServiceAlert[] = [];
    for (const raw of snapshot.alerts) {
      if (routeFilter !== null && !raw.routeIds.includes(routeFilter)) continue;
      // Works starting next week and windows that already closed are not
      // current disruptions: the page presents everything here as active.
      if (!isActive(raw, now)) continue;
      const affectedRoutes: RouteSummary[] = [];
      for (const routeId of raw.routeIds) {
        const route = routes.get(routeId);
        if (route !== undefined) affectedRoutes.push(route);
      }
      alerts.push({
        id: raw.id,
        header: raw.header,
        description: raw.description,
        url: raw.url,
        cause: raw.cause,
        effect: raw.effect,
        activeFrom: raw.activeFrom,
        activeUntil: raw.activeUntil,
        affectedRoutes,
        affectedStopIds: raw.stopIds,
      });
    }

    // Everything here is ongoing; the most recently started comes first.
    alerts.sort((a, b) => (b.activeFrom ?? 0) - (a.activeFrom ?? 0));

    const body: AlertsResponse = {
      alerts,
      feedTimestamp: snapshot.feedTimestamp,
      degraded: snapshot.degraded,
    };
    return jsonOk(body);
  } catch (cause) {
    return failure("alerts", cause);
  }
}
