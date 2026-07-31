/** @type {import("prettier").Config} */
module.exports = {
  plugins: ["prettier-plugin-astro", "prettier-plugin-tailwindcss"],
  tailwindFunctions: ["cn", "cva", "clsx", "twMerge"],

  overrides: [
    // Projects
    {
      files: "app/**/*",
      options: {
        tailwindStylesheet: "./app/src/global.css",
      },
    },
    {
      files: "website/**/*",
      options: {
        tailwindStylesheet: "./website/src/styles/global.css",
      },
    },
    // Languages
    {
      files: "**/*.astro",
      options: { parser: "astro" },
    },
  ],
};
