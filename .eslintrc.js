module.exports = {
    root: true,
    env: {
        node: true
    },
    extends: [
        'plugin:vue/essential',
        '@vue/typescript/recommended'
    ],
    parserOptions: {
        ecmaVersion: 2020
    },
    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        semi: ["error", "always"],
        quotes: ["error", "double"],
        "space-before-function-paren": "off",
        "vue/return-in-computed-property": "off",
        "vue/max-attributes-per-line": [
            "error",
            {
                singleline: 3,
                multiline: 1
            }
        ],
        "no-unused-expressions": ["error"],
        "padding-line-between-statements": [
            "error",
            { blankLine: "always", prev: "*", next: "if" },
            { blankLine: "always", prev: "if", next: "*" }
        ],
        "vue/html-closing-bracket-spacing": "off",
        "vue/multiline-html-element-content-newline": "off",
        "vue/singleline-html-element-content-newline": "off",
        "vue/html-self-closing": "off",
        "vue/this-in-template": 2,
        "vue/attribute-hyphenation": ["error", "always"]
    },
    overrides: [
        {
            files: [
                '**/__tests__/*.{j,t}s?(x)',
                '**/tests/unit/**/*.spec.{j,t}s?(x)'
            ],
            env: {
                jest: true, es6: true, browser: true
            }
        }
    ]
};
