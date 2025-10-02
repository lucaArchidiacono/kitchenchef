import type { MiddlewareHandler } from "astro";

export const onRequest: MiddlewareHandler = async ({ request, locals }, next) => {
  return next();
};

