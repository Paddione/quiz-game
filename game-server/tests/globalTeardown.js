/**
 * Jest global teardown
 * Runs once after all tests complete
 */

export default async function globalTeardown() {
    console.log('🧹 Cleaning up test environment...');

    // Calculate test run duration
    if (global.testState?.startTime) {
        const duration = Date.now() - global.testState.startTime;
        console.log(`⏱️  Total test run time: ${duration}ms`);
    }

    // Clean up any remaining test state
    await cleanupTestState();

    // Clear global mocks
    clearGlobalMocks();

    // Force garbage collection if available
    if (global.gc) {
        global.gc();
    }

    console.log('✅ Test environment cleanup complete');
}

/**
 * Cleans up test state and resources
 */
async function cleanupTestState() {
    try {
        // Clean up mock databases
        if (global.mockUserDatabase) {
            global.mockUserDatabase.clear();
        }

        if (global.mockLobbyDatabase) {
            global.mockLobbyDatabase.clear();
        }

        if (global.mockGameSessions) {
            global.mockGameSessions.clear();
        }

        // Run any registered cleanup functions
        if (global.testCleanup && Array.isArray(global.testCleanup)) {
            for (const cleanup of global.testCleanup) {
                try {
                    await cleanup();
                } catch (error) {
                    console.warn('Warning: Cleanup function failed:', error.message);
                }
            }
        }

        // Clear the cleanup array
        global.testCleanup = [];

        // Disconnect mock services
        if (global.mockFirebaseConnection) {
            await global.mockFirebaseConnection.disconnect();
        }

    } catch (error) {
        console.error('Error during test cleanup:', error);
    }
}

/**
 * Clears global mock objects
 */
function clearGlobalMocks() {
    // Clear global test utilities
    delete global.testUtils;
    delete global.testState;
    delete global.testCleanup;

    // Clear mock databases
    delete global.mockQuestionDatabase;
    delete global.mockUserDatabase;
    delete global.mockLobbyDatabase;
    delete global.mockGameSessions;
    delete global.mockFirebaseConnection;

    // Clear environment variables set during tests
    const testEnvVars = [
        'FIREBASE_PROJECT_ID',
        'FIREBASE_CLIENT_EMAIL',
        'FIREBASE_PRIVATE_KEY',
        'SESSION_SECRET',
        'ADMIN_PASSWORD',
        'LOG_LEVEL'
    ];

    testEnvVars.forEach(envVar => {
        if (process.env[envVar] && process.env[envVar].includes('test')) {
            delete process.env[envVar];
        }
    });
}