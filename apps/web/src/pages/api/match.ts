import type { APIRoute } from "astro";
import { experimental_buildLlmPrompt, generateText } from "@vercel/ai";

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const recentLikes: Array<{ id: number; title: string }> = body.recentLikes || [];
  const urls: string[] = body.urls || [];

  const system = `You are a cooking assistant. Evaluate if the user should COOK the last liked recipe now based on up to 10 swipes. Consider diversity, simplicity, recency, and the provided URLs inspiration. Respond with a single JSON object: { "decision": "cook" | "skip", "reason": string }`;
  const last = recentLikes[recentLikes.length - 1];
  const user = `Recent likes titles: ${recentLikes.map((r) => r.title).join(" | ")}\nURLs: ${urls.join(", ")}\nLast candidate: ${last?.title}`;

  try {
    const { text } = await generateText({
      model: {
        provider: "openai",
        name: "gpt-4o-mini",
      },
      system,
      prompt: user,
      temperature: 0.2,
      maxTokens: 150,
    });
    let parsed: any = { decision: "skip", reason: "No decision" };
    try { parsed = JSON.parse(text); } catch {}
    return new Response(JSON.stringify(parsed), { headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ decision: "skip", reason: "AI unavailable" }), { status: 200, headers: { "Content-Type": "application/json" } });
  }
};

