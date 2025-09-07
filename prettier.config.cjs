/** @type {import('prettier').Config} */
module.exports = {
  // Style de base
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: false, // le projet utilise des doubles quotes
  quoteProps: "as-needed",
  trailingComma: "all",
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: "always",
  endOfLine: "lf",
  // Plugins
  plugins: ["prettier-plugin-tailwindcss"],
};
