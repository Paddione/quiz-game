/**
 * @fileoverview Jest configuration file for the Quiz Game project.
 * Configures the test environment, setup files, coverage collection,
 * and thresholds for ensuring code quality.
 *
 * @author Quiz Game Team
 * @version 1.0.0
 */

export default {
    // Specifies the test environment, 'node' for backend tests.
    testEnvironment: 'node',

    // A list of paths to modules that run some code to configure or set up the testing framework before each test file in the suite is executed.
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

    // An array of glob patterns indicating a set of files for which coverage information should be collected.
    // It excludes test files themselves and any spec files.
    collectCoverageFrom: [
        '**/src/**/*.js', // Collect coverage from all .js files in any src directory
        'shared/**/*.js', // Also collect coverage from .js files in the shared directory
        '!**/node_modules/**', // Exclude node_modules
        '!**/tests/**', // Exclude test directories
        '!**/*.test.js', // Exclude files ending with .test.js
        '!**/*.spec.js', // Exclude files ending with .spec.js
        '!jest.config.js', // Exclude this config file
    ],

    // An object that configures minimum threshold enforcement for coverage results.
    // Thresholds can be global or specified per file.
    coverageThreshold: {
        global: {
            branches: 80, // Minimum 80% branch coverage
            functions: 80, // Minimum 80% function coverage
            lines: 80, // Minimum 80% line coverage
            statements: -10, // Allow up to 10 uncovered statements (can be set to 0 or a positive number for stricter checks)
        },
    },

    // Indicates whether each individual test should be reported during the run.
    verbose: true,

    // Automatically clear mock calls and instances between every test.
    clearMocks: true,

    // The directory where Jest should output its coverage files.
    coverageDirectory: 'coverage',

    // A list of reporter names that Jest uses when writing coverage reports.
    coverageReporters: ['json', 'lcov', 'text', 'clover', 'html'],

    // Transform files with babel-jest for ES6+ support if not using ES modules natively with Node.
    // If your project uses ES modules (import/export syntax) and your Node version supports it,
    // you might not need explicit transformation for .js files.
    // However, if you encounter syntax errors, you might need to configure Babel.
    // For now, assuming Node.js environment is set up for ES Modules.
    // transform: {
    //   '^.+\\.js$': 'babel-jest',
    // },

    // Module file extensions for Jest to look for.
    moduleFileExtensions: ['js', 'json', 'node'],

    // Tell Jest to look for tests in any .test.js or .spec.js files.
    testMatch: [
        '**/tests/**/*.test.js?(x)',
        '**/?(*.)+(spec|test).js?(x)'
    ],

    // Directories that Jest should ignore.
    testPathIgnorePatterns: [
        '/node_modules/',
        '/dist/',
        '/coverage/'
    ],

    // An array of regexp pattern strings that are matched against all source file paths before transformation.
    // If the file path matches any ofr the patterns, it will not be transformed.
    transformIgnorePatterns: [
        '/node_modules/',
        '\\.pnp\\.[^\\/]+$'
    ],

    // This option allows use of a custom resolver.
    // resolver: undefined,

    // This option allows the use of a custom watchman configuration.
    // watchman: true,
};
