/** @type {import("prettier").Config} */
export default {
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindStylesheet: "./src/global.css",
  tailwindFunctions: ["cn", "cva", "clsx", "twMerge"],
};
