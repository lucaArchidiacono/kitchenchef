import fetch from "node-fetch";
import * as cheerio from "cheerio";
import { scrapeRecipePage, upsertRecipe } from "../index";

async function discoverFoobyRecipeUrls(): Promise<string[]> {
  const startUrls = [
    "https://www.fooby.ch/en/recipes.html",
    "https://www.fooby.ch/de/rezepte.html",
    "https://www.fooby.ch/fr/recettes.html",
    "https://www.fooby.ch/it/ricette.html",
  ];

  const found = new Set<string>();
  for (const url of startUrls) {
    const res = await fetch(url);
    if (!res.ok) continue;
    const html = await res.text();
    const $ = cheerio.load(html);
    $("a[href]").each((_, el) => {
      const href = $(el).attr("href");
      if (!href) return;
      const abs = href.startsWith("http") ? href : new URL(href, url).toString();
      if (/\/recipes\//.test(abs) || /\/(rezepte|recettes|ricette)\//.test(abs)) {
        found.add(abs.split("#")[0]);
      }
    });
  }
  return Array.from(found);
}

async function main() {
  const urls = await discoverFoobyRecipeUrls();
  console.log(`Discovered ${urls.length} fooby urls`);
  let count = 0;
  for (const url of urls) {
    try {
      const normalized = await scrapeRecipePage(url);
      await upsertRecipe(normalized);
      count++;
      if (count % 10 === 0) console.log(`Saved ${count}/${urls.length}`);
    } catch (err) {
      console.warn("Skip:", url, (err as Error).message);
    }
  }
  console.log("Done. Saved:", count);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

