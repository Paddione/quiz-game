/**
 * Example test file for LobbyController
 * Demonstrates testing patterns for controller modules
 */

import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { LobbyController } from '../../game-server/src/controllers/lobby.controller.js';
import { LobbyService } from '../../game-server/src/services/lobby.service.js';
import { LobbyError, ValidationError } from '../../shared/errors.js';
import { httpHelpers, gameHelpers } from '../helpers/index.js';

// Mock dependencies
jest.mock('../../game-server/src/services/lobby.service.js');

describe('LobbyController', () => {
    let lobbyController;
    let mockLobbyService;
    let mockReq;
    let mockRes;
    let mockNext;

    beforeEach(() => {
        // Setup fresh mocks for each test
        mockLobbyService = {
            createLobby: jest.fn(),
            getLobby: jest.fn(),
            joinLobby: jest.fn(),
            leaveLobby: jest.fn(),
            updateLobbySettings: jest.fn(),
            deleteLobby: jest.fn(),
            getAllLobbies: jest.fn(),
            transferHost: jest.fn()
        };

        lobbyController = new LobbyController(mockLobbyService);
        mockReq = httpHelpers.createMockReq();
        mockRes = httpHelpers.createMockRes();
        mockNext = httpHelpers.createMockNext();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createLobby', () => {
        test('should create lobby successfully with valid data', async () => {
            // Arrange
            const lobbyData = {
                name: 'Test Lobby',
                maxPlayers: 6,
                settings: {
                    categories: ['general', 'science'],
                    questionCount: 15,
                    timePerQuestion: 30
                }
            };
            const hostUser = global.testUtils.createMockUser({ id: 'host123' });
            const expectedLobby = global.testUtils.createMockLobby({
                ...lobbyData,
                hostId: hostUser.id
            });

            mockReq.body = lobbyData;
            mockReq.user = hostUser;
            mockLobbyService.createLobby.mockResolvedValue(expectedLobby);

            // Act
            await lobbyController.createLobby(mockReq, mockRes, mockNext);

            // Assert
            expect(mockLobbyService.createLobby).toHaveBeenCalledWith(hostUser, lobbyData);
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: { lobby: expectedLobby }
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        test('should handle missing required fields', async () => {
            // Arrange
            const incompleteData = { name: 'Test Lobby' }; // Missing maxPlayers
            const hostUser = global.testUtils.createMockUser();

            mockReq.body = incompleteData;
            mockReq.user = hostUser;
            mockLobbyService.createLobby.mockRejectedValue(
                new ValidationError('maxPlayers is required', 'maxPlayers')
            );

            // Act
            await lobbyController.createLobby(mockReq, mockRes, mockNext);

            // Assert
            expect(mockNext).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'maxPlayers is required',
                    field: 'maxPlayers'
                })
            );
            expect(mockRes.json).not.toHaveBeenCalled();
        });

        test('should handle unauthenticated user', async () => {
            // Arrange
            const lobbyData = { name: 'Test Lobby', maxPlayers: 4 };

            mockReq.body = lobbyData;
            mockReq.user = null; // No authenticated user

            // Act
            await lobbyController.createLobby(mockReq, mockRes, mockNext);

            // Assert
            expect(mockNext).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: expect.stringContaining('Authentication required')
                })
            );
            expect(mockLobbyService.createLobby).not.toHaveBeenCalled();
        });

        test('should handle service errors gracefully', async () => {
            // Arrange
            const lobbyData = { name: 'Test Lobby', maxPlayers: 4 };
            const hostUser = global.testUtils.createMockUser();

            mockReq.body = lobbyData;
            mockReq.user = hostUser;
            mockLobbyService.createLobby.mockRejectedValue(new Error('Database connection failed'));

            // Act
            await lobbyController.createLobby(mockReq, mockRes, mockNext);

            // Assert
            expect(mockNext).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Database connection failed'
                })
            );
        });
    });

    describe('joinLobby', () => {
        test('should allow user to join lobby successfully', async () => {
            // Arrange
            const lobbyId = 'lobby123';
            const player = global.testUtils.createMockUser({ id: 'player456' });
            const updatedLobby = global.testUtils.createMockLobby({
                id: lobbyId,
                players: [player]
            });

            mockReq.params = { lobbyId };
            mockReq.user = player;
            mockLobbyService.joinLobby.mockResolvedValue(updatedLobby);

            // Act
            await lobbyController.joinLobby(mockReq, mockRes, mockNext);

            // Assert
            expect(mockLobbyService.joinLobby).toHaveBeenCalledWith(lobbyId, player);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: { lobby: updatedLobby }
            });
        });

        test('should reject joining non-existent lobby', async () => {
            // Arrange
            const nonExistentLobbyId = 'nonexistent';
            const player = global.testUtils.createMockUser();

            mockReq.params = { lobbyId: nonExistentLobbyId };
            mockReq.user = player;
            mockLobbyService.joinLobby.mockRejectedValue(
                new LobbyError('Lobby not found', nonExistentLobbyId)
            );

            // Act
            await lobbyController.joinLobby(mockReq, mockRes, mockNext);

            // Assert
            expect(mockNext).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Lobby not found',
                    lobbyId: nonExistentLobbyId
                })
            );
        });

        test('should reject joining full lobby', async () => {
            // Arrange
            const fullLobbyId = 'full-lobby';
            const player = global.testUtils.createMockUser();

            mockReq.params = { lobbyId: fullLobbyId };
            mockReq.user = player;
            mockLobbyService.joinLobby.mockRejectedValue(
                new LobbyError('Lobby is full', fullLobbyId)
            );

            // Act
            await lobbyController.joinLobby(mockReq, mockRes, mockNext);

            // Assert
            expect(mockNext).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Lobby is full'
                })
            );
        });

        test('should handle already joined lobby', async () => {
            // Arrange
            const lobbyId = 'lobby123';
            const player = global.testUtils.createMockUser();

            mockReq.params = { lobbyId };
            mockReq.user = player;
            mockLobbyService.joinLobby.mockRejectedValue(
                new LobbyError('Player already in lobby', lobbyId)
            );

            // Act
            await lobbyController.joinLobby(mockReq, mockRes, mockNext);

            // Assert
            expect(mockNext).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Player already in lobby'
                })
            );
        });
    });

    describe('leaveLobby', () => {
        test('should allow player to leave lobby', async () => {
            // Arrange
            const lobbyId = 'lobby123';
            const player = global.testUtils.createMockUser();
            const updatedLobby = global.testUtils.createMockLobby({
                id: lobbyId,
                players: [] // Player has left
            });

            mockReq.params = { lobbyId };
            mockReq.user = player;
            mockLobbyService.leaveLobby.mockResolvedValue(updatedLobby);

            // Act
            await lobbyController.leaveLobby(mockReq, mockRes, mockNext);

            // Assert
            expect(mockLobbyService.leaveLobby).toHaveBeenCalledWith(lobbyId, player.id);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: { lobby: updatedLobby }
            });
        });

        test('should handle host leaving lobby', async () => {
            // Arrange
            const lobbyId = 'lobby123';
            const host = global.testUtils.createMockUser({ id: 'host123' });
            const updatedLobby = global.testUtils.createMockLobby({
                id: lobbyId,
                hostId: 'new-host-id' // Host has been transferred
            });

            mockReq.params = { lobbyId };
            mockReq.user = host;
            mockLobbyService.leaveLobby.mockResolvedValue(updatedLobby);

            // Act
            await lobbyController.leaveLobby(mockReq, mockRes, mockNext);

            // Assert
            expect(mockLobbyService.leaveLobby).toHaveBeenCalledWith(lobbyId, host.id);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: { lobby: updatedLobby }
            });
        });

        test('should handle player not in lobby', async () => {
            // Arrange
            const lobbyId = 'lobby123';
            const player = global.testUtils.createMockUser();

            mockReq.params = { lobbyId };
            mockReq.user = player;
            mockLobbyService.leaveLobby.mockRejectedValue(
                new LobbyError('Player not in lobby', lobbyId)
            );

            // Act
            await lobbyController.leaveLobby(mockReq, mockRes, mockNext);

            // Assert
            expect(mockNext).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Player not in lobby'
                })
            );
        });
    });

    describe('getLobby', () => {
        test('should retrieve lobby by ID', async () => {
            // Arrange
            const lobbyId = 'lobby123';
            const expectedLobby = global.testUtils.createMockLobby({ id: lobbyId });

            mockReq.params = { lobbyId };
            mockLobbyService.getLobby.mockResolvedValue(expectedLobby);

            // Act
            await lobbyController.getLobby(mockReq, mockRes, mockNext);

            // Assert
            expect(mockLobbyService.getLobby).toHaveBeenCalledWith(lobbyId);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: { lobby: expectedLobby }
            });
        });

        test('should handle invalid lobby ID format', async () => {
            // Arrange
            const invalidLobbyId = '';

            mockReq.params = { lobbyId: invalidLobbyId };

            // Act
            await lobbyController.getLobby(mockReq, mockRes, mockNext);

            // Assert
            expect(mockNext).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: expect.stringContaining('Invalid lobby ID')
                })
            );
            expect(mockLobbyService.getLobby).not.toHaveBeenCalled();
        });
    });

    describe('getAllLobbies', () => {
        test('should retrieve all public lobbies', async () => {
            // Arrange
            const lobbies = [
                global.testUtils.createMockLobby({ id: 'lobby1', name: 'Lobby 1' }),
                global.testUtils.createMockLobby({ id: 'lobby2', name: 'Lobby 2' })
            ];

            mockLobbyService.getAllLobbies.mockResolvedValue(lobbies);

            // Act
            await lobbyController.getAllLobbies(mockReq, mockRes, mockNext);

            // Assert
            expect(mockLobbyService.getAllLobbies).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: { lobbies }
            });
        });

        test('should handle empty lobby list', async () => {
            // Arrange
            mockLobbyService.getAllLobbies.mockResolvedValue([]);

            // Act
            await lobbyController.getAllLobbies(mockReq, mockRes, mockNext);

            // Assert
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: { lobbies: [] }
            });
        });

        test('should handle database errors', async () => {
            // Arrange
            mockLobbyService.getAllLobbies.mockRejectedValue(new Error('Database error'));

            // Act
            await lobbyController.getAllLobbies(mockReq, mockRes, mockNext);

            // Assert
            expect(mockNext).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Database error'
                })
            );
        });
    });

    describe('updateLobbySettings', () => {
        test('should update lobby settings as host', async () => {
            // Arrange
            const lobbyId = 'lobby123';
            const host = global.testUtils.createMockUser({ id: 'host123' });
            const newSettings = {
                maxPlayers: 10,
                settings: {
                    categories: ['general', 'science', 'history'],
                    questionCount: 20,
                    timePerQuestion: 45
                }
            };
            const updatedLobby = global.testUtils.createMockLobby({
                id: lobbyId,
                hostId: host.id,
                ...newSettings
            });

            mockReq.params = { lobbyId };
            mockReq.body = newSettings;
            mockReq.user = host;
            mockLobbyService.updateLobbySettings.mockResolvedValue(updatedLobby);

            // Act
            await lobbyController.updateLobbySettings(mockReq, mockRes, mockNext);

            // Assert
            expect(mockLobbyService.updateLobbySettings).toHaveBeenCalledWith(
                lobbyId,
                host.id,
                newSettings
            );
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: { lobby: updatedLobby }
            });
        });

        test('should reject non-host trying to update settings', async () => {
            // Arrange
            const lobbyId = 'lobby123';
            const nonHost = global.testUtils.createMockUser({ id: 'player456' });
            const newSettings = { maxPlayers: 10 };

            mockReq.params = { lobbyId };
            mockReq.body = newSettings;
            mockReq.user = nonHost;
            mockLobbyService.updateLobbySettings.mockRejectedValue(
                new LobbyError('Only host can update lobby settings', lobbyId)
            );

            // Act
            await lobbyController.updateLobbySettings(mockReq, mockRes, mockNext);

            // Assert
            expect(mockNext).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Only host can update lobby settings'
                })
            );
        });

        test('should validate settings before update', async () => {
            // Arrange
            const lobbyId = 'lobby123';
            const host = global.testUtils.createMockUser({ id: 'host123' });
            const invalidSettings = { maxPlayers: -1 }; // Invalid value

            mockReq.params = { lobbyId };
            mockReq.body = invalidSettings;
            mockReq.user = host;
            mockLobbyService.updateLobbySettings.mockRejectedValue(
                new ValidationError('maxPlayers must be positive', 'maxPlayers')
            );

            // Act
            await lobbyController.updateLobbySettings(mockReq, mockRes, mockNext);

            // Assert
            expect(mockNext).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'maxPlayers must be positive',
                    field: 'maxPlayers'
                })
            );
        });
    });

    describe('deleteLobby', () => {
        test('should delete lobby as host', async () => {
            // Arrange
            const lobbyId = 'lobby123';
            const host = global.testUtils.createMockUser({ id: 'host123' });

            mockReq.params = { lobbyId };
            mockReq.user = host;
            mockLobbyService.deleteLobby.mockResolvedValue(true);

            // Act
            await lobbyController.deleteLobby(mockReq, mockRes, mockNext);

            // Assert
            expect(mockLobbyService.deleteLobby).toHaveBeenCalledWith(lobbyId, host.id);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: 'Lobby deleted successfully'
            });
        });

        test('should reject non-host trying to delete lobby', async () => {
            // Arrange
            const lobbyId = 'lobby123';
            const nonHost = global.testUtils.createMockUser({ id: 'player456' });

            mockReq.params = { lobbyId };
            mockReq.user = nonHost;
            mockLobbyService.deleteLobby.mockRejectedValue(
                new LobbyError('Only host can delete lobby', lobbyId)
            );

            // Act
            await lobbyController.deleteLobby(mockReq, mockRes, mockNext);

            // Assert
            expect(mockNext).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Only host can delete lobby'
                })
            );
        });

        test('should handle deletion of non-existent lobby', async () => {
            // Arrange
            const nonExistentLobbyId = 'nonexistent';
            const host = global.testUtils.createMockUser({ id: 'host123' });

            mockReq.params = { lobbyId: nonExistentLobbyId };
            mockReq.user = host;
            mockLobbyService.deleteLobby.mockRejectedValue(
                new LobbyError('Lobby not found', nonExistentLobbyId)
            );

            // Act
            await lobbyController.deleteLobby(mockReq, mockRes, mockNext);

            // Assert
            expect(mockNext).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Lobby not found'
                })
            );
        });
    });

    describe('transferHost', () => {
        test('should transfer host to another player', async () => {
            // Arrange
            const lobbyId = 'lobby123';
            const currentHost = global.testUtils.createMockUser({ id: 'host123' });
            const newHostId = 'player456';
            const updatedLobby = global.testUtils.createMockLobby({
                id: lobbyId,
                hostId: newHostId
            });

            mockReq.params = { lobbyId };
            mockReq.body = { newHostId };
            mockReq.user = currentHost;
            mockLobbyService.transferHost.mockResolvedValue(updatedLobby);

            // Act
            await lobbyController.transferHost(mockReq, mockRes, mockNext);

            // Assert
            expect(mockLobbyService.transferHost).toHaveBeenCalledWith(
                lobbyId,
                currentHost.id,
                newHostId
            );
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: { lobby: updatedLobby }
            });
        });

        test('should reject non-host trying to transfer host', async () => {
            // Arrange
            const lobbyId = 'lobby123';
            const nonHost = global.testUtils.createMockUser({ id: 'player456' });
            const newHostId = 'player789';

            mockReq.params = { lobbyId };
            mockReq.body = { newHostId };
            mockReq.user = nonHost;
            mockLobbyService.transferHost.mockRejectedValue(
                new LobbyError('Only current host can transfer host privileges', lobbyId)
            );

            // Act
            await lobbyController.transferHost(mockReq, mockRes, mockNext);

            // Assert
            expect(mockNext).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Only current host can transfer host privileges'
                })
            );
        });

        test('should validate new host exists in lobby', async () => {
            // Arrange
            const lobbyId = 'lobby123';
            const host = global.testUtils.createMockUser({ id: 'host123' });
            const invalidNewHostId = 'nonexistent-player';

            mockReq.params = { lobbyId };
            mockReq.body = { newHostId: invalidNewHostId };
            mockReq.user = host;
            mockLobbyService.transferHost.mockRejectedValue(
                new LobbyError('New host must be a player in the lobby', lobbyId)
            );

            // Act
            await lobbyController.transferHost(mockReq, mockRes, mockNext);

            // Assert
            expect(mockNext).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'New host must be a player in the lobby'
                })
            );
        });
    });

    describe('Input Validation', () => {
        test('should validate lobby ID format in all endpoints', async () => {
            // Arrange
            const invalidLobbyIds = ['', null, undefined, 'invalid-format'];
            const user = global.testUtils.createMockUser();

            for (const invalidId of invalidLobbyIds) {
                // Reset mocks
                mockRes.status.mockClear();
                mockRes.json.mockClear();
                mockNext.mockClear();

                mockReq.params = { lobbyId: invalidId };
                mockReq.user = user;

                // Act
                await lobbyController.getLobby(mockReq, mockRes, mockNext);

                // Assert
                expect(mockNext).toHaveBeenCalledWith(
                    expect.objectContaining({
                        message: expect.stringContaining('Invalid lobby ID')
                    })
                );
            }
        });

        test('should sanitize user input in lobby creation', async () => {
            // Arrange
            const maliciousData = {
                name: '<script>alert("xss")</script>',
                maxPlayers: 'not-a-number',
                settings: {
                    categories: ['<script>alert("xss")</script>'],
                    questionCount: 'invalid',
                    timePerQuestion: -1
                }
            };
            const user = global.testUtils.createMockUser();

            mockReq.body = maliciousData;
            mockReq.user = user;
            mockLobbyService.createLobby.mockRejectedValue(
                new ValidationError('Invalid input data', 'body')
            );

            // Act
            await lobbyController.createLobby(mockReq, mockRes, mockNext);

            // Assert
            expect(mockNext).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Invalid input data'
                })
            );
        });
    });

    describe('Error Handling Edge Cases', () => {
        test('should handle service throwing unexpected errors', async () => {
            // Arrange
            const lobbyId = 'lobby123';
            const user = global.testUtils.createMockUser();

            mockReq.params = { lobbyId };
            mockReq.user = user;

            // Simulate unexpected error type
            const unexpectedError = new TypeError('Cannot read property of undefined');
            mockLobbyService.getLobby.mockRejectedValue(unexpectedError);

            // Act
            await lobbyController.getLobby(mockReq, mockRes, mockNext);

            // Assert
            expect(mockNext).toHaveBeenCalledWith(unexpectedError);
        });

        test('should handle concurrent lobby operations', async () => {
            // Arrange
            const lobbyId = 'lobby123';
            const users = [
                global.testUtils.createMockUser({ id: 'user1' }),
                global.testUtils.createMockUser({ id: 'user2' }),
                global.testUtils.createMockUser({ id: 'user3' })
            ];

            // Mock service to simulate race condition
            let callCount = 0;
            mockLobbyService.joinLobby.mockImplementation(() => {
                callCount++;
                if (callCount > 1) {
                    return Promise.reject(new LobbyError('Lobby is full', lobbyId));
                }
                return Promise.resolve(global.testUtils.createMockLobby({ id: lobbyId }));
            });

            // Act - Simulate concurrent join requests
            const requests = users.map(user => {
                const req = httpHelpers.createMockReq({
                    params: { lobbyId },
                    user
                });
                const res = httpHelpers.createMockRes();
                const next = httpHelpers.createMockNext();

                return lobbyController.joinLobby(req, res, next);
            });

            await Promise.all(requests);

            // Assert
            expect(mockLobbyService.joinLobby).toHaveBeenCalledTimes(3);
        });
    });

    describe('Performance and Load Testing', () => {
        test('should handle multiple lobby retrievals efficiently', async () => {
            // Arrange
            const lobbyIds = Array.from({ length: 50 }, (_, i) => `lobby${i}`);
            mockLobbyService.getLobby.mockImplementation((id) =>
                Promise.resolve(global.testUtils.createMockLobby({ id }))
            );

            // Act
            const start = Date.now();
            const requests = lobbyIds.map(async (lobbyId) => {
                const req = httpHelpers.createMockReq({ params: { lobbyId } });
                const res = httpHelpers.createMockRes();
                const next = httpHelpers.createMockNext();

                return lobbyController.getLobby(req, res, next);
            });

            await Promise.all(requests);
            const duration = Date.now() - start;

            // Assert
            expect(duration).toBeLessThan(1000); // Should complete within 1 second
            expect(mockLobbyService.getLobby).toHaveBeenCalledTimes(50);
        });
    });
});