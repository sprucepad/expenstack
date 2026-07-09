// @ts-check
import { defineConfig, fontProviders } from "astro/config";

import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://expenstack.sprucepad.net/",
  integrations: [sitemap()],

  vite: {
    resolve: { tsconfigPaths: true },
    plugins: [tailwindcss()],
  },

  fonts: [
    {
      name: "DM Sans",
      cssVariable: "--font-dm-sans",
      provider: fontProviders.google(),
      weights: [400, 900],
    },
  ],
});
