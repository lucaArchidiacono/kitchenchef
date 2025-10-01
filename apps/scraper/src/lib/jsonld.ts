import * as cheerio from "cheerio";

export interface NormalizedRecipe {
  sourceId: string;
  sourceUrl: string;
  sourceName: string;
  title: string;
  description?: string;
  imageUrl?: string;
  cuisine?: string;
  course?: string;
  ingredients: string[];
  instructions: string[];
  totalTimeMinutes?: number;
  yields?: string;
  calories?: number;
}

function parseDurationToMinutes(duration?: string | number): number | undefined {
  if (!duration) return undefined;
  if (typeof duration === "number") return duration;
  // ISO 8601 duration like PT1H30M
  const match = duration.match(/P(T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?/);
  if (!match) return undefined;
  const hours = parseInt(match[2] || "0", 10);
  const minutes = parseInt(match[3] || "0", 10);
  const seconds = parseInt(match[4] || "0", 10);
  return hours * 60 + minutes + Math.round(seconds / 60);
}

export function parseRecipeFromHtml(html: string, opts: { sourceUrl: string; sourceName?: string }): NormalizedRecipe {
  const $ = cheerio.load(html);
  const ldJson: any[] = [];
  $("script[type='application/ld+json']").each((_, el) => {
    try {
      const txt = $(el).contents().text();
      if (!txt) return;
      const parsed = JSON.parse(txt);
      if (Array.isArray(parsed)) {
        ldJson.push(...parsed);
      } else {
        ldJson.push(parsed);
      }
    } catch {
      // ignore
    }
  });

  const candidates = ldJson.flatMap((node) => {
    if (!node) return [];
    if (node["@type"] === "Recipe") return [node];
    if (Array.isArray(node["@graph"])) return node["@graph"].filter((g: any) => g["@type"] === "Recipe");
    return [];
  });
  if (candidates.length === 0) {
    throw new Error("No JSON-LD Recipe found in page");
  }
  const recipe = candidates[0];

  const title: string = recipe.name || $("title").text().trim() || "Untitled Recipe";
  const description: string | undefined = recipe.description;
  const imageUrl: string | undefined = Array.isArray(recipe.image) ? recipe.image[0] : recipe.image;
  const cuisine: string | undefined = recipe.recipeCuisine;
  const course: string | undefined = recipe.recipeCategory;
  const ingredients: string[] = (recipe.recipeIngredient || []) as string[];
  const instructions: string[] = Array.isArray(recipe.recipeInstructions)
    ? recipe.recipeInstructions.map((ins: any) => (typeof ins === "string" ? ins : ins.text).trim()).filter(Boolean)
    : typeof recipe.recipeInstructions === "string"
    ? recipe.recipeInstructions.split(/\n+/).map((s: string) => s.trim()).filter(Boolean)
    : [];
  const totalTimeMinutes = parseDurationToMinutes(recipe.totalTime || recipe.cookTime || recipe.prepTime);
  const yields: string | undefined = recipe.recipeYield ? String(recipe.recipeYield) : undefined;
  const calories: number | undefined = recipe.nutrition?.calories ? parseInt(String(recipe.nutrition.calories), 10) : undefined;

  const sourceUrl = opts.sourceUrl;
  const sourceId = sourceUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const sourceName = opts.sourceName || new URL(sourceUrl).hostname.replace(/^www\./, "");

  return {
    sourceId,
    sourceUrl,
    sourceName,
    title,
    description,
    imageUrl,
    cuisine,
    course,
    ingredients,
    instructions,
    totalTimeMinutes,
    yields,
    calories,
  };
}

