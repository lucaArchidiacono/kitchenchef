import { parseRecipeFromHtml } from "./lib/jsonld";
import { getDb, schema } from "@repo/db";
import fetch from "node-fetch";

export async function scrapeRecipePage(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const html = await res.text();
  const recipe = parseRecipeFromHtml(html, { sourceUrl: url });
  return recipe;
}

export async function upsertRecipe(normalized: ReturnType<typeof parseRecipeFromHtml>) {
  const db = getDb();
  const existing = await db
    .select()
    .from(schema.recipes)
    .where(schema.recipes.sourceId.eq(normalized.sourceId))
    .limit(1);
  if (existing.length > 0) {
    await db
      .update(schema.recipes)
      .set({
        title: normalized.title,
        description: normalized.description ?? null,
        imageUrl: normalized.imageUrl ?? null,
        cuisine: normalized.cuisine ?? null,
        course: normalized.course ?? null,
        ingredients: JSON.stringify(normalized.ingredients),
        instructions: JSON.stringify(normalized.instructions),
        totalTimeMinutes: normalized.totalTimeMinutes ?? null,
        yields: normalized.yields ?? null,
        calories: normalized.calories ?? null,
        updatedAt: Math.floor(Date.now() / 1000),
      })
      .where(schema.recipes.sourceId.eq(normalized.sourceId));
    return { action: "update", id: existing[0].id };
  } else {
    const inserted = await db
      .insert(schema.recipes)
      .values({
        sourceId: normalized.sourceId,
        sourceUrl: normalized.sourceUrl,
        sourceName: normalized.sourceName,
        title: normalized.title,
        description: normalized.description ?? null,
        imageUrl: normalized.imageUrl ?? null,
        cuisine: normalized.cuisine ?? null,
        course: normalized.course ?? null,
        ingredients: JSON.stringify(normalized.ingredients),
        instructions: JSON.stringify(normalized.instructions),
        totalTimeMinutes: normalized.totalTimeMinutes ?? null,
        yields: normalized.yields ?? null,
        calories: normalized.calories ?? null,
      })
      .returning({ id: schema.recipes.id });
    return { action: "insert", id: inserted[0].id };
  }
}

