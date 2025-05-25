/**
 * Jest global setup
 * Runs once before all tests begin
 */

import { jest } from '@jest/globals';

export default async function globalSetup() {
    console.log('🧪 Setting up test environment...');

    // Set test environment variables
    process.env.NODE_ENV = 'test';
    process.env.LOG_LEVEL = 'error'; // Suppress logs during testing

    // Initialize global test state
    global.testState = {
        startTime: Date.now(),
        testRunId: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    // Setup global cleanup array
    global.testCleanup = [];

    // Mock external services globally
    await setupMockServices();

    console.log('✅ Test environment setup complete');
}

/**
 * Sets up mock external services for testing
 */
async function setupMockServices() {
    // Mock Firebase connection test
    global.mockFirebaseConnection = {
        isConnected: true,
        lastPing: Date.now(),
        connect: jest.fn(() => Promise.resolve()),
        disconnect: jest.fn(() => Promise.resolve())
    };

    // Mock question database
    global.mockQuestionDatabase = [
        {
            id: 'q1',
            question: 'What is the capital of France?',
            answers: ['London', 'Berlin', 'Paris', 'Madrid'],
            correctAnswer: 2,
            category: 'geography',
            difficulty: 'easy'
        },
        {
            id: 'q2',
            question: 'What is 2 + 2?',
            answers: ['3', '4', '5', '6'],
            correctAnswer: 1,
            category: 'math',
            difficulty: 'easy'
        },
        {
            id: 'q3',
            question: 'Which planet is closest to the Sun?',
            answers: ['Venus', 'Mercury', 'Earth', 'Mars'],
            correctAnswer: 1,
            category: 'science',
            difficulty: 'medium'
        }
    ];

    // Mock user database
    global.mockUserDatabase = new Map([
        ['user1', {
            id: 'user1',
            email: 'test1@example.com',
            displayName: 'Test User 1',
            isGuest: false,
            createdAt: new Date().toISOString()
        }],
        ['user2', {
            id: 'user2',
            email: 'test2@example.com',
            displayName: 'Test User 2',
            isGuest: false,
            createdAt: new Date().toISOString()
        }],
        ['guest1', {
            id: 'guest1',
            displayName: 'Guest User',
            isGuest: true,
            createdAt: new Date().toISOString()
        }]
    ]);

    // Mock lobby database
    global.mockLobbyDatabase = new Map();

    // Mock game sessions
    global.mockGameSessions = new Map();
}