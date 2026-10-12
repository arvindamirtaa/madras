type PlaceRow = {
  id: number;
  name: string;
  area: string;
  address: string;
  wifi: 0 | 1 | null;
  power_sockets: 0 | 1 | null;
  work_friendliness: string | null;
  category: string;
  description: string;
  website: string | null;
  sources: string;
};

const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "X-Content-Type-Options": "nosniff"
};

export default {
  async fetch(request, env): Promise<Response> {
    const path = new URL(request.url).pathname;
    if (path !== "/api" && !path.startsWith("/api/")) return env.ASSETS.fetch(request);

    if (path !== "/api/places") {
      return Response.json({ error: "API route not found" }, { status: 404, headers: jsonHeaders });
    }
    if (request.method !== "GET") {
      return Response.json({ error: "Method not allowed" }, {
        status: 405,
        headers: { ...jsonHeaders, Allow: "GET" }
      });
    }

    try {
      const { results } = await env.DB.prepare(`
        SELECT id, name, area, address, wifi, power_sockets, work_friendliness,
               category, description, website, sources
        FROM places
        ORDER BY name COLLATE NOCASE, area COLLATE NOCASE
      `).all<PlaceRow>();

      const places = results.map(row => {
        const sources: unknown = JSON.parse(row.sources);
        return {
          id: row.id,
          name: row.name,
          area: row.area,
          address: row.address,
          wifi: row.wifi === null ? null : row.wifi === 1,
          powerSockets: row.power_sockets === null ? null : row.power_sockets === 1,
          workFriendliness: row.work_friendliness,
          category: row.category,
          description: row.description,
          website: row.website,
          sources: Array.isArray(sources) ? sources.filter((source): source is string => typeof source === "string") : []
        };
      });
      return Response.json({ places }, {
        headers: { ...jsonHeaders, "Cache-Control": "public, max-age=60" }
      });
    } catch (error) {
      console.error(JSON.stringify({
        event: "directory_query_failed",
        error: error instanceof Error ? error.message : "Unknown database error"
      }));
      return Response.json({ error: "The directory is temporarily unavailable. Please try again." }, {
        status: 503,
        headers: { ...jsonHeaders, "Cache-Control": "no-store" }
      });
    }
  }
} satisfies ExportedHandler<Env>;
