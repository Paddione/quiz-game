/**
 * Jest configuration for Quiz Game project
 * Provides comprehensive testing setup with coverage thresholds
 */

export default {
    // Test environment
    testEnvironment: 'node',

    // Setup files
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

    // Module paths
    roots: ['<rootDir>/auth-server', '<rootDir>/game-server', '<rootDir>/shared', '<rootDir>/tests'],

    // Test file patterns
    testMatch: [
        '**/__tests__/**/*.js',
        '**/*.test.js',
        '**/*.spec.js'
    ],

    // Coverage collection
    collectCoverageFrom: [
        'auth-server/src/**/*.js',
        'game-server/src/**/*.js',
        'shared/**/*.js',
        '!**/*.test.js',
        '!**/*.spec.js',
        '!**/node_modules/**',
        '!**/coverage/**',
        '!**/dist/**'
    ],

    // Coverage thresholds (80% minimum as per PLANNING.md)
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
        },
        // Specific thresholds for critical modules
        'shared/validation.js': {
            branches: 90,
            functions: 90,
            lines: 90,
            statements: 90
        },
        'auth-server/src/services/auth.service.js': {
            branches: 85,
            functions: 85,
            lines: 85,
            statements: 85
        }
    },

    // Coverage reporters
    coverageReporters: ['text', 'lcov', 'html', 'json-summary'],

    // Coverage directory
    coverageDirectory: '<rootDir>/coverage',

    // Module name mapping for easier imports
    moduleNameMapping: {
        '^@shared/(.*)$': '<rootDir>/shared/$1',
        '^@auth/(.*)$': '<rootDir>/auth-server/src/$1',
        '^@game/(.*)$': '<rootDir>/game-server/src/$1'
    },

    // Transform configuration for ES modules
    transform: {
        '^.+\\.js$': 'babel-jest'
    },

    // ES modules support
    extensionsToTreatAsEsm: ['.js'],

    // Global setup/teardown
    globalSetup: '<rootDir>/tests/globalSetup.js',
    globalTeardown: '<rootDir>/tests/globalTeardown.js',

    // Test timeout (30 seconds for integration tests)
    testTimeout: 30000,

    // Verbose output for debugging
    verbose: true,

    // Clear mocks between tests
    clearMocks: true,

    // Restore mocks after each test
    restoreMocks: true,

    // Error handling
    errorOnDeprecated: true,

    // Max workers for parallel testing
    maxWorkers: '50%'
};