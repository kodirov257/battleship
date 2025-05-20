/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
    testEnvironment: 'node',
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    // testMatch: ['**/?(*.)+(test|spec).ts'],
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(ts)$',
    moduleFileExtensions: ['ts', 'js', 'json'],
    restoreMocks: true,
    resetMocks: true,
    moduleDirectories: ['node_modules', '<rootDir>/src'],
    transform: {
        '^.+\\.ts?$': ['ts-jest',{}],
    },
};