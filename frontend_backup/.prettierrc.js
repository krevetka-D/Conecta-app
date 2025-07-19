// .prettierrc.js
module.exports = {
    // Line length
    printWidth: 100,

    // Indentation
    tabWidth: 4,
    useTabs: false,

    // Semicolons
    semi: true,

    // Quotes
    singleQuote: true,
    quoteProps: 'as-needed',
    jsxSingleQuote: false,

    // Trailing commas
    trailingComma: 'es5',

    // Brackets
    bracketSpacing: true,
    bracketSameLine: false,

    // Arrow functions
    arrowParens: 'always',

    // Other
    endOfLine: 'lf',
    htmlWhitespaceSensitivity: 'css',
    insertPragma: false,
    requirePragma: false,
    proseWrap: 'preserve',
    vueIndentScriptAndStyle: false,

    // Parser
    parser: 'babel',

    // Overrides for specific file types
    overrides: [
        {
            files: '*.json',
            options: {
                printWidth: 200,
            },
        },
        {
            files: '*.md',
            options: {
                proseWrap: 'always',
            },
        },
    ],
};