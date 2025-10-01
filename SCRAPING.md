## Scraping Recipes

This repo includes a Bun-based scraper with a JSON-LD extractor. Many recipe sites embed `application/ld+json` with `@type: Recipe`. We parse that and normalize.

### Fooby.ch

- Start pages:
  - https://www.fooby.ch/en/recipes.html
  - https://www.fooby.ch/de/rezepte.html
  - https://www.fooby.ch/fr/recettes.html
  - https://www.fooby.ch/it/ricette.html
- The scraper discovers links containing `/recipes/` or localized variants.
- Each recipe page is fetched and parsed for JSON-LD Recipe.

Run:

```
bun run scrape:fooby
```

### Other Free Sources (JSON-LD present)

- Simply Recipes (`https://www.simplyrecipes.com/`) – has JSON-LD
- BBC Good Food (`https://www.bbcgoodfood.com/recipes`) – has JSON-LD
- Allrecipes (`https://www.allrecipes.com/`) – JSON-LD often present (respect robots.txt)
- Serious Eats (`https://www.seriouseats.com/`) – JSON-LD present

To scrape a specific URL:

```
bun run scrape:url https://www.bbcgoodfood.com/recipes/classic-lasagne
```

### Notes

- Respect robots.txt and site terms. Use reasonable concurrency and cache if you scale.
- The scraper uses a generic JSON-LD parser; individual sources can be added under `apps/scraper/src/sources`.

