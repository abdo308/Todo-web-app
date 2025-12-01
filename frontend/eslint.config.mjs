// eslint.config.mjs
import js from "@eslint/js";
import react from "eslint-plugin-react";
import globals from "globals";

export default [
  // 1) Ignore generated / vendor stuff so we don't lint bundles
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      ".vite/**",
      "coverage/**",
      "public/**",
    ],
  },

  // 2) Base JS recommended rules
  js.configs.recommended,

  // 3) Frontend source files (React + browser + node globals)
  {
    files: ["frontend/**/*.{js,jsx}", "frontend/main.jsx"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      ecmaFeatures: {
        jsx: true, // <-- allow JSX (<App /> etc.)
      },
      globals: {
        // Browser globals: fetch, localStorage, navigator, setTimeout, console, etc.
        ...globals.browser,
        // Node globals: process, __dirname, etc. (for things like vite.config)
        ...globals.node,
      },
    },
    plugins: {
      react,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      // keep this from your config
      "no-unused-vars": "warn",

      // optional relaxations to reduce noise from vendor libs / old code:
      "no-prototype-builtins": "off", // allow obj.hasOwnProperty(...)
      "react/react-in-jsx-scope": "off", // for React 17+ (no need to import React)
      // you can add more here if something annoys you
    },
  },
];
