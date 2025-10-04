import type { APIRoute } from "astro";
import { getDb } from "@repo/db";

export const GET: APIRoute = async () => {
  try {
    const db = getDb();
    await db.execute("select 1;");
    return new Response(JSON.stringify({ ok: true, db: true }), { headers: { "Content-Type": "application/json" } });
  } catch {
    return new Response(JSON.stringify({ ok: true, db: false }), { headers: { "Content-Type": "application/json" } });
  }
};

