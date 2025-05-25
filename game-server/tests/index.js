/**
 * Test helper utilities
 * Provides common testing utilities and assertions
 */

import { jest } from '@jest/globals';

/**
 * Database test helpers
 */
export const dbHelpers = {
    /**
     * Creates a mock database connection
     * @returns {Object} Mock database instance
     */
    createMockDb: () => ({
        collection: jest.fn(() => ({
            doc: jest.fn(() => ({
                get: jest.fn(() => Promise.resolve({
                    exists: true,
                    data: () => ({ id: 'mock-id' })
                })),
                set: jest.fn(() => Promise.resolve()),
                update: jest.fn(() => Promise.resolve()),
                delete: jest.fn(() => Promise.resolve())
            })),
            add: jest.fn(() => Promise.resolve({ id: 'mock-doc-id' })),
            where: jest.fn(() => ({
                get: jest.fn(() => Promise.resolve({
                    docs: []
                }))
            }))
        }))
    }),

    /**
     * Mocks Firestore batch operations
     * @returns {Object} Mock batch instance
     */
    createMockBatch: () => ({
        set: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        commit: jest.fn(() => Promise.resolve())
    })
};

/**
 * HTTP test helpers
 */
export const httpHelpers = {
    /**
     * Creates a mock Express request object
     * @param {Object} overrides - Request properties to override
     * @returns {Object} Mock request object
     */
    createMockReq: (overrides = {}) => ({
        body: {},
        params: {},
        query: {},
        headers: {},
        user: null,
        session: {},
        ...overrides
    }),

    /**
     * Creates a mock Express response object
     * @param {Object} overrides - Response properties to override
     * @returns {Object} Mock response object
     */
    createMockRes: (overrides = {}) => {
        const res = {
            status: jest.fn(() => res),
            json: jest.fn(() => res),
            send: jest.fn(() => res),
            cookie: jest.fn(() => res),
            clearCookie: jest.fn(() => res),
            redirect: jest.fn(() => res),
            render: jest.fn(() => res),
            ...overrides
        };
        return res;
    },

    /**
     * Creates a mock Express next function
     * @returns {Function} Mock next function
     */
    createMockNext: () => jest.fn()
};

/**
 * Socket.IO test helpers
 */
export const socketHelpers = {
    /**
     * Creates a mock Socket.IO server
     * @returns {Object} Mock server instance
     */
    createMockServer: () => ({
        on: jest.fn(),
        emit: jest.fn(),
        to: jest.fn(() => ({
            emit: jest.fn()
        })),
        sockets: {
            sockets: new Map()
        },
        of: jest.fn(() => ({
            on: jest.fn(),
            emit: jest.fn()
        }))
    }),

    /**
     * Creates a mock socket with event simulation
     * @param {Object} overrides - Socket properties to override
     * @returns {Object} Enhanced mock socket
     */
    createMockSocketWithEvents: (overrides = {}) => {
        const eventHandlers = new Map();

        const socket = {
            id: 'mock-socket-id',
            emit: jest.fn(),
            on: jest.fn((event, handler) => {
                eventHandlers.set(event, handler);
            }),
            off: jest.fn((event) => {
                eventHandlers.delete(event);
            }),
            join: jest.fn(),
            leave: jest.fn(),
            disconnect: jest.fn(),
            handshake: {
                auth: {},
                headers: {}
            },
            // Helper method to simulate events
            simulate: (event, ...args) => {
                const handler = eventHandlers.get(event);
                if (handler) {
                    handler(...args);
                }
            },
            ...overrides
        };

        return socket;
    }
};

/**
 * Validation test helpers
 */
export const validationHelpers = {
    /**
     * Tests Zod schema validation
     * @param {Object} schema - Zod schema to test
     * @param {Object} validData - Valid data that should pass
     * @param {Object} invalidData - Invalid data that should fail
     * @returns {Object} Test results
     */
    testSchema: (schema, validData, invalidData) => {
        const validResult = schema.safeParse(validData);
        const invalidResult = schema.safeParse(invalidData);

        return {
            valid: {
                success: validResult.success,
                data: validResult.data,
                error: validResult.error
            },
            invalid: {
                success: invalidResult.success,
                data: invalidResult.data,
                error: invalidResult.error
            }
        };
    },

    /**
     * Creates test cases for boundary testing
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {Object} Boundary test cases
     */
    createBoundaryTests: (min, max) => ({
        belowMin: min - 1,
        atMin: min,
        aboveMin: min + 1,
        belowMax: max - 1,
        atMax: max,
        aboveMax: max + 1
    })
};

/**
 * Game logic test helpers
 */
export const gameHelpers = {
    /**
     * Creates a full game state for testing
     * @param {Object} options - Game configuration options
     * @returns {Object} Complete game state
     */
    createGameState: (options = {}) => {
        const defaults = {
            playerCount: 4,
            questionCount: 10,
            categories: ['general'],
            timePerQuestion: 30
        };

        const config = { ...defaults, ...options };
        const players = [];

        for (let i = 0; i < config.playerCount; i++) {
            players.push({
                id: `player-${i}`,
                name: `Player ${i + 1}`,
                score: 0,
                isHost: i === 0,
                isReady: false
            });
        }

        const questions = [];
        for (let i = 0; i < config.questionCount; i++) {
            questions.push(global.testUtils.createMockQuestion({
                id: `question-${i}`,
                question: `Question ${i + 1}?`
            }));
        }

        return {
            lobby: global.testUtils.createMockLobby({
                players,
                settings: {
                    categories: config.categories,
                    questionCount: config.questionCount,
                    timePerQuestion: config.timePerQuestion
                }
            }),
            game: global.testUtils.createMockGame({
                questions,
                scores: players.reduce((acc, player) => {
                    acc[player.id] = 0;
                    return acc;
                }, {})
            })
        };
    },

    /**
     * Simulates a complete game round
     * @param {Object} gameState - Current game state
     * @param {number} questionIndex - Question to simulate
     * @returns {Object} Updated game state
     */
    simulateGameRound: (gameState, questionIndex) => {
        const question = gameState.game.questions[questionIndex];
        const answers = {};

        // Simulate random answers from players
        gameState.lobby.players.forEach((player, index) => {
            // 70% chance of correct answer for variation
            const isCorrect = Math.random() > 0.3;
            answers[player.id] = {
                answer: isCorrect ? question.correctAnswer : (question.correctAnswer + 1) % 4,
                timeToAnswer: Math.floor(Math.random() * 20) + 5, // 5-25 seconds
                isCorrect
            };
        });

        return {
            ...gameState,
            game: {
                ...gameState.game,
                currentQuestionIndex: questionIndex,
                answers
            }
        };
    }
};

/**
 * Performance test helpers
 */
export const performanceHelpers = {
    /**
     * Measures execution time of a function
     * @param {Function} fn - Function to measure
     * @param {...any} args - Arguments to pass to function
     * @returns {Object} Execution time and result
     */
    measureTime: async (fn, ...args) => {
        const start = process.hrtime.bigint();
        const result = await fn(...args);
        const end = process.hrtime.bigint();

        return {
            result,
            timeNs: Number(end - start),
            timeMs: Number(end - start) / 1000000
        };
    },

    /**
     * Creates a performance test runner
     * @param {number} iterations - Number of iterations to run
     * @returns {Function} Test runner function
     */
    createPerformanceTest: (iterations = 100) => {
        return async (fn, ...args) => {
            const times = [];

            for (let i = 0; i < iterations; i++) {
                const { timeMs } = await performanceHelpers.measureTime(fn, ...args);
                times.push(timeMs);
            }

            times.sort((a, b) => a - b);

            return {
                iterations,
                min: times[0],
                max: times[times.length - 1],
                median: times[Math.floor(times.length / 2)],
                average: times.reduce((sum, time) => sum + time, 0) / times.length,
                p95: times[Math.floor(times.length * 0.95)],
                p99: times[Math.floor(times.length * 0.99)]
            };
        };
    }
};

/**
 * Custom Jest matchers
 */
export const customMatchers = {
    /**
     * Matches objects with specific properties
     */
    toHaveProperties: (received, expected) => {
        const pass = expected.every(prop => received.hasOwnProperty(prop));
        return {
            pass,
            message: () =>
                pass
                    ? `Expected ${JSON.stringify(received)} not to have properties ${expected.join(', ')}`
                    : `Expected ${JSON.stringify(received)} to have properties ${expected.join(', ')}`
        };
    },

    /**
     * Matches valid UUIDs
     */
    toBeValidUUID: (received) => {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        const pass = typeof received === 'string' && uuidRegex.test(received);

        return {
            pass,
            message: () =>
                pass
                    ? `Expected ${received} not to be a valid UUID`
                    : `Expected ${received} to be a valid UUID`
        };
    },

    /**
     * Matches valid timestamps
     */
    toBeValidTimestamp: (received) => {
        const date = new Date(received);
        const pass = !isNaN(date.getTime());

        return {
            pass,
            message: () =>
                pass
                    ? `Expected ${received} not to be a valid timestamp`
                    : `Expected ${received} to be a valid timestamp`
        };
    }
};

// Export all helpers as default
export default {
    dbHelpers,
    httpHelpers,
    socketHelpers,
    validationHelpers,
    gameHelpers,
    performanceHelpers,
    customMatchers
};