module.exports = {
    defaultSeverity: 'warning',
    ignoreFiles: ['./public/**/*.css'],
    extends: [
        'stylelint-config-standard',
        'stylelint-config-idiomatic-order',
    ],
    rules: {
        indentation: 4,
        'custom-property-empty-line-before': 'never',
        'declaration-empty-line-before': 'never',
        'at-rule-no-unknown': [
            true,
            {
                ignoreAtRules: [
                    'function',
                    'if',
                    'for',
                    'extend',
                    'include',
                    'mixin',
                ],
            },
        ],
    },
}
