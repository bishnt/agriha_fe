import type { CodegenConfig } from "@graphql-codegen/cli"

const config: CodegenConfig = {
  overwrite: true,
  schema: process.env.GRAPHQL_SCHEMA_URL || "http://localhost:4000/graphql",
  documents: ["graphql/**/*.ts", "components/**/*.tsx", "app/**/*.tsx"],
  generates: {
    "generated/graphql.ts": {
      plugins: ["typescript", "typescript-operations", "typescript-react-apollo"],
      config: {
        withHooks: true,
        withHOC: false,
        withComponent: false,
        apolloReactHooksImportFrom: "@apollo/client",
      },
    },
    "generated/graphql.schema.json": {
      plugins: ["introspection"],
    },
  },
}

export default config
