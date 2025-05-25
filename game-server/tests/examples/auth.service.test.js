/**
 * Example test file for AuthService
 * Demonstrates testing patterns for service modules
 */

import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { AuthService } from '../../auth-server/src/services/auth.service.js';
import { AuthenticationError, ValidationError } from '../../shared/errors.js';
import { httpHelpers, dbHelpers } from '../helpers/index.js';

// Mock Firebase Admin
jest.mock('firebase-admin');

describe('AuthService', () => {
    let authService;
    let mockFirebaseAuth;
    let mockFirestore;

    beforeEach(() => {
        // Setup fresh mocks for each test
        mockFirebaseAuth = {
            verifyIdToken: jest.fn(),
            createUser: jest.fn(),
            updateUser: jest.fn(),
            deleteUser: jest.fn(),
            getUserByEmail: jest.fn(),
            setCustomUserClaims: jest.fn()
        };

        mockFirestore = dbHelpers.createMockDb();
        authService = new AuthService(mockFirebaseAuth, mockFirestore);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('verifyToken', () => {
        test('should verify valid Firebase token successfully', async () => {
            // Arrange
            const validToken = 'valid-firebase-token';
            const expectedUser = {
                uid: 'user123',
                email: 'test@example.com',
                name: 'Test User'
            };
            mockFirebaseAuth.verifyIdToken.mockResolvedValue(expectedUser);

            // Act
            const result = await authService.verifyToken(validToken);

            // Assert
            expect(mockFirebaseAuth.verifyIdToken).toHaveBeenCalledWith(validToken);
            expect(result).toEqual(expectedUser);
        });

        test('should throw AuthenticationError for invalid token', async () => {
            // Arrange
            const invalidToken = 'invalid-token';
            mockFirebaseAuth.verifyIdToken.mockRejectedValue(new Error('Token verification failed'));

            // Act & Assert
            await expect(authService.verifyToken(invalidToken))
                .rejects
                .toThrow(AuthenticationError);

            expect(mockFirebaseAuth.verifyIdToken).toHaveBeenCalledWith(invalidToken);
        });

        test('should throw ValidationError for empty token', async () => {
            // Arrange
            const emptyToken = '';

            // Act & Assert
            await expect(authService.verifyToken(emptyToken))
                .rejects
                .toThrow(ValidationError);

            expect(mockFirebaseAuth.verifyIdToken).not.toHaveBeenCalled();
        });
    });

    describe('createUser', () => {
        test('should create user with valid data', async () => {
            // Arrange
            const userData = {
                email: 'newuser@example.com',
                displayName: 'New User',
                password: 'securePassword123'
            };
            const expectedUserId = 'user456';

            mockFirebaseAuth.createUser.mockResolvedValue({ uid: expectedUserId });
            mockFirestore.collection().doc().set.mockResolvedValue();

            // Act
            const result = await authService.createUser(userData);

            // Assert
            expect(mockFirebaseAuth.createUser).toHaveBeenCalledWith({
                email: userData.email,
                displayName: userData.displayName,
                password: userData.password
            });
            expect(mockFirestore.collection).toHaveBeenCalledWith('users');
            expect(result).toEqual({ uid: expectedUserId });
        });

        test('should handle existing email error', async () => {
            // Arrange
            const userData = {
                email: 'existing@example.com',
                displayName: 'Existing User',
                password: 'password123'
            };

            mockFirebaseAuth.createUser.mockRejectedValue({
                code: 'auth/email-already-exists',
                message: 'Email already exists'
            });

            // Act & Assert
            await expect(authService.createUser(userData))
                .rejects
                .toThrow('Email already exists');
        });

        test('should validate required fields', async () => {
            // Arrange
            const incompleteData = {
                email: 'test@example.com'
                // Missing displayName and password
            };

            // Act & Assert
            await expect(authService.createUser(incompleteData))
                .rejects
                .toThrow(ValidationError);

            expect(mockFirebaseAuth.createUser).not.toHaveBeenCalled();
        });
    });

    describe('createGuestUser', () => {
        test('should create guest user with display name', async () => {
            // Arrange
            const guestName = 'Guest Player';
            const expectedGuestId = 'guest-123';

            // Mock UUID generation
            jest.spyOn(global.crypto, 'randomUUID').mockReturnValue(expectedGuestId);

            // Act
            const result = await authService.createGuestUser(guestName);

            // Assert
            expect(result).toMatchObject({
                id: expectedGuestId,
                displayName: guestName,
                isGuest: true
            });
            expect(result).toHaveProperty('createdAt');
        });

        test('should generate unique guest name if none provided', async () => {
            // Arrange
            const expectedGuestId = 'guest-456';
            jest.spyOn(global.crypto, 'randomUUID').mockReturnValue(expectedGuestId);

            // Act
            const result = await authService.createGuestUser();

            // Assert
            expect(result.displayName).toMatch(/^Guest_\d{4}$/);
            expect(result.isGuest).toBe(true);
        });

        test('should validate guest name length', async () => {
            // Arrange
            const tooLongName = 'A'.repeat(51); // Assuming 50 char limit

            // Act & Assert
            await expect(authService.createGuestUser(tooLongName))
                .rejects
                .toThrow(ValidationError);
        });
    });

    describe('updateUserProfile', () => {
        test('should update user display name', async () => {
            // Arrange
            const userId = 'user123';
            const updates = { displayName: 'Updated Name' };

            mockFirebaseAuth.updateUser.mockResolvedValue({ uid: userId });
            mockFirestore.collection().doc().update.mockResolvedValue();

            // Act
            const result = await authService.updateUserProfile(userId, updates);

            // Assert
            expect(mockFirebaseAuth.updateUser).toHaveBeenCalledWith(userId, updates);
            expect(mockFirestore.collection).toHaveBeenCalledWith('users');
            expect(result.uid).toBe(userId);
        });

        test('should reject invalid user ID', async () => {
            // Arrange
            const invalidUserId = '';
            const updates = { displayName: 'New Name' };

            // Act & Assert
            await expect(authService.updateUserProfile(invalidUserId, updates))
                .rejects
                .toThrow(ValidationError);

            expect(mockFirebaseAuth.updateUser).not.toHaveBeenCalled();
        });

        test('should handle user not found error', async () => {
            // Arrange
            const nonExistentUserId = 'nonexistent';
            const updates = { displayName: 'New Name' };

            mockFirebaseAuth.updateUser.mockRejectedValue({
                code: 'auth/user-not-found',
                message: 'User not found'
            });

            // Act & Assert
            await expect(authService.updateUserProfile(nonExistentUserId, updates))
                .rejects
                .toThrow(AuthenticationError);
        });
    });

    describe('getUserById', () => {
        test('should retrieve user by ID', async () => {
            // Arrange
            const userId = 'user123';
            const userData = {
                uid: userId,
                email: 'test@example.com',
                displayName: 'Test User'
            };

            mockFirestore.collection().doc().get.mockResolvedValue({
                exists: true,
                data: () => userData
            });

            // Act
            const result = await authService.getUserById(userId);

            // Assert
            expect(mockFirestore.collection).toHaveBeenCalledWith('users');
            expect(result).toEqual(userData);
        });

        test('should return null for non-existent user', async () => {
            // Arrange
            const nonExistentId = 'nonexistent';

            mockFirestore.collection().doc().get.mockResolvedValue({
                exists: false
            });

            // Act
            const result = await authService.getUserById(nonExistentId);

            // Assert
            expect(result).toBeNull();
        });

        test('should validate user ID format', async () => {
            // Arrange
            const invalidUserId = null;

            // Act & Assert
            await expect(authService.getUserById(invalidUserId))
                .rejects
                .toThrow(ValidationError);

            expect(mockFirestore.collection).not.toHaveBeenCalled();
        });
    });

    describe('deleteUser', () => {
        test('should delete user and associated data', async () => {
            // Arrange
            const userId = 'user123';

            mockFirebaseAuth.deleteUser.mockResolvedValue();
            mockFirestore.collection().doc().delete.mockResolvedValue();

            // Act
            await authService.deleteUser(userId);

            // Assert
            expect(mockFirebaseAuth.deleteUser).toHaveBeenCalledWith(userId);
            expect(mockFirestore.collection).toHaveBeenCalledWith('users');
        });

        test('should handle delete errors gracefully', async () => {
            // Arrange
            const userId = 'user123';

            mockFirebaseAuth.deleteUser.mockRejectedValue(new Error('Delete failed'));

            // Act & Assert
            await expect(authService.deleteUser(userId))
                .rejects
                .toThrow('Delete failed');
        });
    });

    describe('setUserClaims', () => {
        test('should set custom user claims', async () => {
            // Arrange
            const userId = 'user123';
            const claims = { admin: true, role: 'moderator' };

            mockFirebaseAuth.setCustomUserClaims.mockResolvedValue();

            // Act
            await authService.setUserClaims(userId, claims);

            // Assert
            expect(mockFirebaseAuth.setCustomUserClaims).toHaveBeenCalledWith(userId, claims);
        });

        test('should validate claims object', async () => {
            // Arrange
            const userId = 'user123';
            const invalidClaims = null;

            // Act & Assert
            await expect(authService.setUserClaims(userId, invalidClaims))
                .rejects
                .toThrow(ValidationError);

            expect(mockFirebaseAuth.setCustomUserClaims).not.toHaveBeenCalled();
        });
    });

    describe('Edge Cases and Error Handling', () => {
        test('should handle Firebase connection errors', async () => {
            // Arrange
            const token = 'valid-token';
            mockFirebaseAuth.verifyIdToken.mockRejectedValue(new Error('Connection timeout'));

            // Act & Assert
            await expect(authService.verifyToken(token))
                .rejects
                .toThrow(AuthenticationError);
        });

        test('should handle malformed tokens gracefully', async () => {
            // Arrange
            const malformedToken = 'not.a.valid.jwt.token';
            mockFirebaseAuth.verifyIdToken.mockRejectedValue({
                code: 'auth/argument-error',
                message: 'Malformed token'
            });

            // Act & Assert
            await expect(authService.verifyToken(malformedToken))
                .rejects
                .toThrow(AuthenticationError);
        });

        test('should handle concurrent user operations', async () => {
            // Arrange
            const userData = global.testUtils.createMockUser();
            mockFirebaseAuth.createUser.mockResolvedValue({ uid: userData.id });
            mockFirestore.collection().doc().set.mockResolvedValue();

            // Act - Create multiple users concurrently
            const promises = [
                authService.createUser({ ...userData, email: 'user1@test.com' }),
                authService.createUser({ ...userData, email: 'user2@test.com' }),
                authService.createUser({ ...userData, email: 'user3@test.com' })
            ];

            const results = await Promise.all(promises);

            // Assert
            expect(results).toHaveLength(3);
            expect(mockFirebaseAuth.createUser).toHaveBeenCalledTimes(3);
        });
    });

    describe('Performance Tests', () => {
        test('should handle user verification within acceptable time', async () => {
            // Arrange
            const token = 'performance-test-token';
            const expectedUser = global.testUtils.createMockUser();
            mockFirebaseAuth.verifyIdToken.mockResolvedValue(expectedUser);

            // Act & Assert
            const start = Date.now();
            await authService.verifyToken(token);
            const duration = Date.now() - start;

            expect(duration).toBeLessThan(100); // Should complete within 100ms
        });

        test('should handle batch user operations efficiently', async () => {
            // Arrange
            const userCount = 10;
            const userPromises = [];

            mockFirebaseAuth.createUser.mockImplementation(() =>
                Promise.resolve({ uid: `user-${Date.now()}-${Math.random()}` })
            );

            // Act
            for (let i = 0; i < userCount; i++) {
                userPromises.push(
                    authService.createUser({
                        email: `user${i}@test.com`,
                        displayName: `User ${i}`,
                        password: 'password123'
                    })
                );
            }

            const start = Date.now();
            await Promise.all(userPromises);
            const duration = Date.now() - start;

            // Assert
            expect(duration).toBeLessThan(1000); // Batch should complete within 1 second
            expect(mockFirebaseAuth.createUser).toHaveBeenCalledTimes(userCount);
        });
    });
});