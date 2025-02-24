// module.exports = {
//     testEnvironment: 'node',
//     roots: ['<rootDir>/src'],
//     testMatch: ['**/__tests__/**/*.+(ts|js)', '**/?(*.)+(spec|test).+(ts|js)'],
//     transform: {
//         '^.+\\.(js|ts)$': 'babel-jest',
//     },
//     moduleDirectories: ['node_modules', 'src'],
//     collectCoverage: true,
//     collectCoverageFrom: ['**/*.{js,ts}', '!**/*.d.ts'],
// }

module.exports = {
    roots: ['<rootDir>/src'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
}