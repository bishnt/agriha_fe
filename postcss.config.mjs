// postcss.config.mjs
const config = {
  plugins: {
    '@tailwindcss/postcss': {}, // Use an object for plugins, not just a string
    autoprefixer: {}, // Add autoprefixer as a separate plugin
  },
};

export default config;