import type { APIRoute } from "astro";
import { getDb, schema } from "@repo/db";
import { and, eq } from "drizzle-orm";
import { scrapeAndStoreSource } from "@apps/scraper";

export const POST: APIRoute = async ({ request }) => {
  const db = getDb();
  try {
    const { url, reaction, comment, clientId } = await request.json();
    if (!url || typeof url !== "string") {
      return new Response(JSON.stringify({ error: "url required" }), { status: 400 });
    }
    if (!clientId || typeof clientId !== "string") {
      return new Response(JSON.stringify({ error: "clientId required" }), { status: 400 });
    }

    // Ensure source row exists
    const existingSources = await db.select().from(schema.sources).where(schema.sources.url.eq(url)).limit(1);
    if (existingSources.length === 0) {
      await db.insert(schema.sources).values({ url });
    }

    // Upsert client vote (fetch all for url, mutate in memory, write back)
    const votes = await db.select().from(schema.sourceVotes).where(eq(schema.sourceVotes.url, url));
    const existingVote = votes.find((v: any) => v.clientId === clientId);
    if (!existingVote) {
      await db.insert(schema.sourceVotes).values({ url, clientId, reaction: reaction === "dislike" ? "dislike" : "like", comment: comment || null });
    } else {
      await db
        .update(schema.sourceVotes)
        .set({ reaction: reaction === "dislike" ? "dislike" : "like", comment: comment ?? existingVote.comment ?? null, updatedAt: Math.floor(Date.now() / 1000) })
        .where(and(eq(schema.sourceVotes.url, url), eq(schema.sourceVotes.clientId, clientId)));
    }

    // Recompute aggregates for the source
    const allVotes = await db.select().from(schema.sourceVotes).where(eq(schema.sourceVotes.url, url));
    const likeCount = allVotes.filter((v: any) => v.reaction === "like").length;
    const dislikeCount = allVotes.filter((v: any) => v.reaction === "dislike").length;
    const comments = allVotes.map((v: any) => v.comment).filter(Boolean);

    // Update aggregates on sources
    await db
      .update(schema.sources)
      .set({ likeCount, dislikeCount, comments: JSON.stringify(comments), updatedAt: Math.floor(Date.now() / 1000) })
      .where(schema.sources.url.eq(url));

    // Scrape if needed
    const src = existingSources.length > 0 ? existingSources[0] : null;
    const needScrape = !src || !src.lastScrapedAt;
    if (needScrape) {
      try {
        await scrapeAndStoreSource(url);
      } catch {
        // ignore scraping errors in sync path
      }
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
  } catch {
    return new Response(JSON.stringify({ error: "bad request" }), { status: 400 });
  }
};
