import { scrapeRecipePage, upsertRecipe, scrapeAndStoreSource } from "./index";

async function main() {
  const url = process.argv[2];
  if (!url) {
    console.error("Usage: bun src/scrape-url.ts <url>");
    process.exit(1);
  }
  await scrapeAndStoreSource(url);
  const normalized = await scrapeRecipePage(url);
  const res = await upsertRecipe(normalized);
  console.log("Done:", res);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

