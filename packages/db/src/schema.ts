import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const recipes = sqliteTable("recipes", {
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
});

export type InsertRecipe = typeof recipes.$inferInsert;
export type SelectRecipe = typeof recipes.$inferSelect;

