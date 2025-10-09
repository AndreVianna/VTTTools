import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginReactRefresh from "eslint-plugin-react-refresh";

export default [
  {
	files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
	languageOptions: {
	  parser: tseslint.parser,
	  parserOptions: {
		ecmaFeatures: {
		  jsx: true,
		},
		ecmaVersion: "latest",
		sourceType: "module",
		project: "./tsconfig.json", // Required for some @typescript-eslint rules
	  },
	  globals: {
		...globals.browser,
		...globals.node,
	  },
	},
	plugins: {
	  react: pluginReact,
	  "react-hooks": pluginReactHooks,
	  "react-refresh": pluginReactRefresh,
	  "@typescript-eslint": tseslint.plugin,
	},
	rules: {
	  ...pluginJs.configs.recommended.rules,
	  ...tseslint.configs.recommended.rules,
	  ...pluginReact.configs.recommended.rules,
	  ...pluginReactHooks.configs.recommended.rules,
	  "react-refresh/only-export-components": [
		"warn",
		{ allowConstantExport: true },
	  ],
	  // React 19 JSX transform - no need to import React
	  "react/react-in-jsx-scope": "off",
	  // TypeScript handles prop types
	  "react/prop-types": "off",
	  // Enum values are used at runtime (switch statements, comparisons, JSON)
	  "no-unused-vars": "off",
	  "@typescript-eslint/no-unused-vars": ["error", {
		"argsIgnorePattern": "^_",
		"varsIgnorePattern": "^_",
		"caughtErrorsIgnorePattern": "^_",
		"ignoreRestSiblings": true
	  }]
	},
	settings: {
	  react: {
		version: 'detect',
	  },
	},
  },
];