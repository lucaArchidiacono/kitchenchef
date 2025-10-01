import tailwind from "@astrojs/tailwind";

/** @type {import('astro').AstroUserConfig} */
export default {
  integrations: [tailwind()],
  server: { port: Number(process.env.PORT) || 4321 },
  experimental: {
    middleware: true
  }
};

