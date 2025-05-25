/**
 * Jest test environment setup
 * Configures global test utilities and mocks
 */

import { jest } from '@jest/globals';

// Global test timeout for longer operations
jest.setTimeout(30000);

// Mock console methods to reduce noise in tests
global.console = {
    ...console,
    // Suppress console.log in tests unless VERBOSE_TESTS is set
    log: process.env.VERBOSE_TESTS ? console.log : jest.fn(),
    debug: process.env.VERBOSE_TESTS ? console.debug : jest.fn(),
    info: process.env.VERBOSE_TESTS ? console.info : jest.fn(),
    warn: console.warn, // Keep warnings visible
    error: console.error, // Keep errors visible
};

// Mock process.env defaults for testing
process.env = {
    ...process.env,
    NODE_ENV: 'test',
    FIREBASE_PROJECT_ID: 'test-project',
    FIREBASE_CLIENT_EMAIL: 'test@test-project.iam.gserviceaccount.com',
    FIREBASE_PRIVATE_KEY: 'test-private-key',
    PORT: '3000',
    GAME_PORT: '3001',
    SESSION_SECRET: 'test-session-secret',
    ADMIN_PASSWORD: 'test-admin-password'
};

// Mock Firebase Admin SDK
const mockFirebaseAdmin = {
    initializeApp: jest.fn(),
    credential: {
        cert: jest.fn(() => ({ projectId: 'test-project' }))
    },
    auth: jest.fn(() => ({
        verifyIdToken: jest.fn(),
        createUser: jest.fn(),
        updateUser: jest.fn(),
        deleteUser: jest.fn(),
        getUserByEmail: jest.fn(),
        setCustomUserClaims: jest.fn()
    })),
    firestore: jest.fn(() => ({
        collection: jest.fn(() => ({
            doc: jest.fn(() => ({
                get: jest.fn(),
                set: jest.fn(),
                update: jest.fn(),
                delete: jest.fn()
            })),
            add: jest.fn(),
            where: jest.fn(() => ({
                get: jest.fn()
            }))
        }))
    }))
};

// Mock modules that are commonly used
jest.unstable_mockModule('firebase-admin', () => mockFirebaseAdmin);

// Mock Socket.IO for testing
const mockSocket = {
    emit: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    join: jest.fn(),
    leave: jest.fn(),
    disconnect: jest.fn(),
    id: 'mock-socket-id',
    handshake: {
        auth: {},
        headers: {}
    }
};

const mockIo = {
    on: jest.fn(),
    emit: jest.fn(),
    to: jest.fn(() => mockIo),
    sockets: {
        sockets: new Map()
    },
    of: jest.fn(() => mockIo)
};

jest.unstable_mockModule('socket.io', () => ({
    Server: jest.fn(() => mockIo)
}));

// Global test utilities
global.testUtils = {
    /**
     * Creates a mock socket instance for testing
     * @param {Object} overrides - Socket properties to override
     * @returns {Object} Mock socket instance
     */
    createMockSocket: (overrides = {}) => ({
        ...mockSocket,
        ...overrides,
        emit: jest.fn(),
        on: jest.fn(),
        off: jest.fn(),
        join: jest.fn(),
        leave: jest.fn()
    }),

    /**
     * Creates a mock user for testing
     * @param {Object} overrides - User properties to override
     * @returns {Object} Mock user object
     */
    createMockUser: (overrides = {}) => ({
        id: 'test-user-id',
        email: 'test@example.com',
        displayName: 'Test User',
        isGuest: false,
        ...overrides
    }),

    /**
     * Creates a mock lobby for testing
     * @param {Object} overrides - Lobby properties to override
     * @returns {Object} Mock lobby object
     */
    createMockLobby: (overrides = {}) => ({
        id: 'test-lobby-id',
        hostId: 'test-host-id',
        name: 'Test Lobby',
        maxPlayers: 8,
        players: [],
        gameState: 'waiting',
        settings: {
            categories: ['general'],
            questionCount: 10,
            timePerQuestion: 30
        },
        createdAt: new Date().toISOString(),
        ...overrides
    }),

    /**
     * Creates a mock game session for testing
     * @param {Object} overrides - Game properties to override
     * @returns {Object} Mock game object
     */
    createMockGame: (overrides = {}) => ({
        id: 'test-game-id',
        lobbyId: 'test-lobby-id',
        currentQuestionIndex: 0,
        questions: [],
        scores: {},
        state: 'waiting',
        startedAt: null,
        ...overrides
    }),

    /**
     * Creates a mock question for testing
     * @param {Object} overrides - Question properties to override
     * @returns {Object} Mock question object
     */
    createMockQuestion: (overrides = {}) => ({
        id: 'test-question-id',
        question: 'Test Question?',
        answers: ['Answer A', 'Answer B', 'Answer C', 'Answer D'],
        correctAnswer: 0,
        category: 'general',
        difficulty: 'medium',
        ...overrides
    }),

    /**
     * Waits for a specified amount of time
     * @param {number} ms - Milliseconds to wait
     * @returns {Promise} Promise that resolves after the specified time
     */
    wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

    /**
     * Waits for a condition to be true
     * @param {Function} condition - Function that returns true when condition is met
     * @param {number} timeout - Maximum time to wait in milliseconds
     * @returns {Promise} Promise that resolves when condition is met
     */
    waitFor: async (condition, timeout = 5000) => {
        const start = Date.now();
        while (Date.now() - start < timeout) {
            if (await condition()) {
                return true;
            }
            await global.testUtils.wait(50);
        }
        throw new Error(`Condition not met within ${timeout}ms`);
    }
};

// Setup and teardown hooks
beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Reset any global state
    if (global.testState) {
        global.testState = {};
    }
});

afterEach(() => {
    // Clean up any timers
    jest.clearAllTimers();

    // Clean up any open handles
    if (global.testCleanup) {
        global.testCleanup.forEach(cleanup => cleanup());
        global.testCleanup = [];
    }
});

// Error handling for unhandled promises
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't exit the process in tests, just log the error
});

export { mockFirebaseAdmin, mockSocket, mockIo };