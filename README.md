## Recipe Swipe Monorepo (Astro + Bun + Turso + Vercel AI)

This monorepo contains:

- apps/web: Astro web app with a Tinder-like swipe UI for recipes, Tailwind styling, and API routes powered by the Vercel AI SDK to recommend and match recipes. No authentication; state stored in localStorage.
- apps/scraper: Bun CLI scraper that extracts Recipe JSON-LD from multiple sources (e.g., fooby.ch, simplyrecipes.com, bbcgoodfood.com) and stores normalized recipes in Turso (libSQL) via Drizzle ORM.
- packages/db: Shared database layer (Drizzle schema + Turso client helpers).

### Quick Start

1) Prerequisites
- Bun >= 1.1
- Turso DB (or a libSQL-compatible endpoint)
- OpenAI key (or another model supported by the Vercel AI SDK). The defaults assume OpenAI.

2) Configure environment

Copy `.env.example` to `.env` at the monorepo root and fill values:

```
cp .env.example .env
```

Required variables:
- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`
- `OPENAI_API_KEY`

3) Install dependencies

```
bun install
```

4) Prepare the database (generate/push migrations)

```
bun run db:generate
bun run db:push
```

5) Scrape some recipes (optional but recommended)

```
# Scrape Fooby
bun run scrape:fooby

# Scrape a specific URL (must be a recipe page with JSON-LD)
bun run scrape:url https://www.fooby.ch/en/recipes/12345-foo.html
```

6) Run the web app

```
bun run dev
```

Open the app at `http://localhost:4321`.

### Architecture

- packages/db: Drizzle ORM schema for `recipes` stored in Turso (SQLite).
- apps/scraper: Generic JSON-LD extractor + source-specific crawlers (Fooby and generic sitemap/list parsers). Saves normalized recipes to the DB.
- apps/web: Astro front-end with a React island implementing swipe gestures. Backend API routes call the Vercel AI SDK to re-rank and match recipes based on recent swipes and user-provided URLs (food blogs, recipe links) stored in localStorage.

See `SCRAPING.md` for fooby.ch notes and suggested sources.

