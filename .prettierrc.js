module.exports = {
  singleQuote: true,
  bracketSpacing: false,
  trailingComma: 'es5',
  overrides: [
    {
      files: '*.sol',
      options: {
        printWidth: 80,
        tabWidth: 4,
        useTabs: false,
        singleQuote: false,
        bracketSpacing: false,
        explicitTypes: 'always',
      },
    },
  ],
};
