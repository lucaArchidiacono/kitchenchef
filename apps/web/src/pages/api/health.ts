import type { APIRoute } from "astro";

export const GET: APIRoute = async () => new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });

