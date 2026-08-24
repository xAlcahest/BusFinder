import { BadParam, failure, jsonOk, optionalInt } from "@/app/api/_lib/http";
import { searchRoutes, searchStops } from "@/lib/queries";
import type { SearchResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

const MAX_QUERY_LEN = 100;
const DEFAULT_LIMIT = 20;

export async function GET(request: Request): Promise<Response> {
  try {
    const params = new URL(request.url).searchParams;
    const raw = params.get("q");
    if (raw === null) throw new BadParam('parametro "q" mancante');
    if (raw.length > MAX_QUERY_LEN) throw new BadParam('parametro "q" troppo lungo');
    const query = raw.trim();
    const limit = optionalInt(params, "limit", 1, 50) ?? DEFAULT_LIMIT;

    // A blank query is not an error, it is just an empty result set.
    const body: SearchResponse =
      query.length === 0
        ? { query, stops: [], routes: [] }
        : { query, stops: searchStops(query, limit), routes: searchRoutes(query, limit) };
    return jsonOk(body);
  } catch (cause) {
    return failure("search", cause);
  }
}
