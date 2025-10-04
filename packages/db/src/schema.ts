import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex, primaryKey } from "drizzle-orm/sqlite-core";

export const recipes = sqliteTable(
  "recipes",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    sourceId: text("source_id").notNull(),
    sourceUrl: text("source_url").notNull(),
    sourceName: text("source_name").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    imageUrl: text("image_url"),
    cuisine: text("cuisine"),
    course: text("course"),
    ingredients: text("ingredients", { length: 65535 }).notNull(), // JSON string
    instructions: text("instructions", { length: 65535 }).notNull(), // JSON string
    totalTimeMinutes: integer("total_time_minutes"),
    yields: text("yields"),
    calories: integer("calories"),
    createdAt: integer("created_at").notNull().default(sql`(strftime('%s','now'))`),
    updatedAt: integer("updated_at").notNull().default(sql`(strftime('%s','now'))`),
  },
  (table) => ({
    sourceUrlUnique: uniqueIndex("recipes_source_url_unique").on(table.sourceUrl),
  })
);

export type InsertRecipe = typeof recipes.$inferInsert;
export type SelectRecipe = typeof recipes.$inferSelect;

export const sources = sqliteTable("sources", {
  // Primary identifier is the exact content URL
  url: text("url").primaryKey(),
  htmlS3Url: text("html_s3_url"),
  metadata: text("metadata", { length: 65535 }), // JSON string of metascraper output
  likeCount: integer("like_count").notNull().default(0),
  dislikeCount: integer("dislike_count").notNull().default(0),
  comments: text("comments", { length: 65535 }).notNull().default("[]"), // JSON array of strings
  lastScrapedAt: integer("last_scraped_at"),
  createdAt: integer("created_at").notNull().default(sql`(strftime('%s','now'))`),
  updatedAt: integer("updated_at").notNull().default(sql`(strftime('%s','now'))`),
});

export const sourceVotes = sqliteTable(
  "source_votes",
  {
    url: text("url").notNull(),
    clientId: text("client_id").notNull(),
    reaction: text("reaction").notNull(), // 'like' | 'dislike'
    comment: text("comment"),
    updatedAt: integer("updated_at").notNull().default(sql`(strftime('%s','now'))`),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.url, t.clientId] }),
  })
);

