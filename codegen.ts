
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: "./schema.graphql",
  documents: "src/**/*.tsx",
  generates: {
    "\tsrc/generated/graphql.tsx": {
      preset: "client",
      plugins: []
    }
  }
};

export default config;
