import type { CodegenConfig } from "@graphql-codegen/cli"

const config: CodegenConfig = {
  overwrite: true,
  schema: process.env.GRAPHQL_ENDPOINT || "https://api-agriha.centralindia.cloudapp.azure.com/api/graphql",
  documents: ["lib/graphql.ts", "lib/**/*.ts", "components/**/*.tsx", "app/**/*.tsx"],
  config: {
    skipValidation: true,
  },
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
