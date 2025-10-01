import type { APIRoute } from "astro";
import { getDb, schema } from "@repo/db";

export const GET: APIRoute = async () => {
  const db = getDb();
  const rows = await db
    .select({ id: schema.recipes.id, title: schema.recipes.title, imageUrl: schema.recipes.imageUrl, description: schema.recipes.description })
    .from(schema.recipes)
    .orderBy(schema.recipes.updatedAt.desc())
    .limit(20);

  return new Response(JSON.stringify({ items: rows }), {
    headers: { "Content-Type": "application/json" },
  });
};

