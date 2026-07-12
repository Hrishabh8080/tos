import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

/**
 * ESLint 10-ready flat config using eslint-config-next 16's native flat config.
 *
 * The React Compiler lint rules that ship with eslint-config-next 16
 * (`react-hooks/immutability`, `react-hooks/set-state-in-effect`) are new and
 * intentionally aggressive — they flag pre-existing, correct patterns such as
 * calling a `const`-declared fetch function from an effect, or setting a
 * loading flag before an async fetch. We keep genuine correctness rules as
 * errors but relax these experimental rules (and the stylistic
 * `no-unescaped-entities`) to warnings so the build stays green without
 * churning working code.
 */
const eslintConfig = [
  ...nextCoreWebVitals,
  {
    rules: {
      "react-hooks/immutability": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "react/no-unescaped-entities": "warn",
    },
  },
  {
    ignores: [".next/**", "node_modules/**", "public/**"],
  },
];

export default eslintConfig;
