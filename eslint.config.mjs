import next from "eslint-config-next";
import prettier from "eslint-config-prettier";

// Use Next.js flat config array and append project-specific rules and Prettier config.
const config = [
  ...next,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  // Disable formatting-related rules that might conflict with Prettier
  prettier,
];

export default config;
