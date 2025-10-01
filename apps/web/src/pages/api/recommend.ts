import type { APIRoute } from "astro";
import { getDb, schema } from "@repo/db";
import { generateText } from "@vercel/ai";

// Returns a re-ranked set of recipe IDs for a feed, based on local likes and URLs
export const POST: APIRoute = async ({ request }) => {
  const { candidates, likes, urls } = await request.json();
  const titles = candidates.map((c: any) => c.title);

  try {
    const { text } = await generateText({
      model: { provider: "openai", name: "gpt-4o-mini" },
      system: `You re-rank recipe titles based on user signals (likes and URLs). Return strictly a JSON array of indices in preferred order.`,
      prompt: `Titles: ${JSON.stringify(titles)}\nLikes: ${JSON.stringify(likes?.map((l: any) => l.title) || [])}\nURLs: ${JSON.stringify(urls || [])}`,
      temperature: 0.3,
      maxTokens: 150,
    });
    let order: number[] = [];
    try { order = JSON.parse(text); } catch { order = []; }
    if (!Array.isArray(order) || order.length !== candidates.length) order = candidates.map((_: any, i: number) => i);
    const items = order.map((i: number) => candidates[i]);
    return new Response(JSON.stringify({ items }), { headers: { "Content-Type": "application/json" } });
  } catch {
    return new Response(JSON.stringify({ items: candidates }), { headers: { "Content-Type": "application/json" } });
  }
};

