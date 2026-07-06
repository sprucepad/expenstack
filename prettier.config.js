/** @type {import("prettier").Config} */
module.exports = {
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindStylesheet: "./src/global.css",
  tailwindFunctions: ["cn", "cva", "clsx", "twMerge"],
};
