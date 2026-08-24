import { BadParam, failure, jsonOk, notFound, requireId } from "@/app/api/_lib/http";
import { lineDetail } from "@/lib/queries";
import type { LineDetail } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ routeId: string }> },
): Promise<Response> {
  try {
    const { routeId: rawRouteId } = await context.params;
    const routeId = requireId(rawRouteId, "routeId");
    const params = new URL(request.url).searchParams;

    const rawDirection = params.get("direction");
    let direction = 0;
    if (rawDirection !== null && rawDirection.trim().length > 0) {
      const value = rawDirection.trim();
      if (value !== "0" && value !== "1") throw new BadParam('parametro "direction" deve essere 0 o 1');
      direction = Number(value);
    }

    const detail: LineDetail | null = lineDetail(routeId, direction);
    if (detail === null) return notFound("Linea non trovata", routeId);
    return jsonOk(detail);
  } catch (cause) {
    return failure("line", cause);
  }
}
