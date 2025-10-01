import { scrapeRecipePage, upsertRecipe } from "./index";

async function main() {
  const url = process.argv[2];
  if (!url) {
    console.error("Usage: bun src/scrape-url.ts <url>");
    process.exit(1);
  }
  const normalized = await scrapeRecipePage(url);
  const res = await upsertRecipe(normalized);
  console.log("Done:", res);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

