/**
 * @fileoverview Global setup file for Jest tests.
 * This file is executed once per test file, after the testing framework is installed in the environment
 * but before the test code itself.
 *
 * You can use this file to:
 * - Set up global mocks (e.g., for 'fetch', 'localStorage')
 * - Configure testing utilities (e.g., enzyme for React)
 * - Define global helper functions for tests
 *
 * @author Quiz Game Team
 * @version 1.0.0
 */

// Example: Mocking console methods to prevent clutter during tests
// You can enable/disable these or make them more sophisticated as needed.

// global.console = {
//   ...console, // Keep original console methods
//   log: jest.fn(), // Mock console.log
//   debug: jest.fn(), // Mock console.debug
//   info: jest.fn(), // Mock console.info
//   warn: jest.fn(), // Mock console.warn
//   error: jest.fn(), // Mock console.error
// };

// If you need to set up any environment variables for your tests:
// process.env.NODE_ENV = 'test';

// Add any other global setup here.
// For example, if using a library that needs initialization:
// import SomeLibrary from 'some-library';
// SomeLibrary.initialize({ /* options */ });

console.log('Jest global setup file loaded.');
