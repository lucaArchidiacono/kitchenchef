import { parseRecipeFromHtml } from "./lib/jsonld";
import { getDb, schema } from "@repo/db";
import fetch from "node-fetch";
import metascraper from "metascraper";
import msAuthor from "metascraper-author";
import msDate from "metascraper-date";
import msDescription from "metascraper-description";
import msImage from "metascraper-image";
import msLang from "metascraper-lang";
import msLogo from "metascraper-logo";
import msPublisher from "metascraper-publisher";
import msTitle from "metascraper-title";
import msUrl from "metascraper-url";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const scraper = metascraper([
  msAuthor(),
  msDate(),
  msDescription(),
  msImage(),
  msLang(),
  msLogo(),
  msPublisher(),
  msTitle(),
  msUrl(),
]);

function getS3Client(): S3Client | null {
  const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  if (!process.env.S3_BUCKET || !region || !accessKeyId || !secretAccessKey) {
    return null;
  }
  return new S3Client({ region, credentials: { accessKeyId, secretAccessKey } });
}

async function uploadHtmlToS3(html: string, url: string): Promise<string | null> {
  const bucket = process.env.S3_BUCKET;
  const client = getS3Client();
  if (!bucket || !client) return null;
  const urlObj = new URL(url);
  const safeKey = `${urlObj.hostname}${urlObj.pathname}`
    .replace(/^\//, "")
    .replace(/\/$/, "")
    .replace(/[^a-zA-Z0-9/_.-]/g, "-") || "index";
  const key = `html/${safeKey}.html`;
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: html,
      ContentType: "text/html; charset=utf-8",
    })
  );
  const publicBase = process.env.S3_PUBLIC_BASE_URL; // optional CDN/public base
  return publicBase ? `${publicBase.replace(/\/$/, "")}/${key}` : `s3://${bucket}/${key}`;
}

export async function scrapeRecipePage(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const html = await res.text();
  const recipe = parseRecipeFromHtml(html, { sourceUrl: url });
  return recipe;
}

export async function scrapeAndStoreSource(url: string) {
  const db = getDb();
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const html = await res.text();
  const [htmlS3Url, metadata] = await Promise.all([
    uploadHtmlToS3(html, url),
    scraper({ html, url }),
  ]);

  const existing = await db.select().from(schema.sources).where(schema.sources.url.eq(url)).limit(1);
  if (existing.length > 0) {
    await db
      .update(schema.sources)
      .set({
        htmlS3Url: htmlS3Url ?? existing[0].htmlS3Url,
        metadata: JSON.stringify(metadata),
        lastScrapedAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000),
      })
      .where(schema.sources.url.eq(url));
  } else {
    await db.insert(schema.sources).values({
      url,
      htmlS3Url: htmlS3Url ?? null,
      metadata: JSON.stringify(metadata),
      likeCount: 0,
      dislikeCount: 0,
      comments: "[]",
      lastScrapedAt: Math.floor(Date.now() / 1000),
    });
  }

  return { htmlS3Url, metadata } as const;
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

