/**
 * Example integration test file
 * Demonstrates testing patterns for multi-service interactions
 */

import { jest, describe, test, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { LobbyService } from '../../game-server/src/services/lobby.service.js';
import { GameService } from '../../game-server/src/services/game.service.js';
import { LobbyManager } from '../../game-server/src/managers/lobbyManager.js';
import { GameManager } from '../../game-server/src/managers/gameManager.js';
import { socketHelpers, gameHelpers } from '../helpers/index.js';

describe('Game Integration Tests', () => {
    let httpServer;
    let io;
    let lobbyService;
    let gameService;
    let lobbyManager;
    let gameManager;
    let clientSockets;

    beforeAll(async () => {
        // Setup test server
        httpServer = createServer();
        io = new Server(httpServer, {
            cors: { origin: "*" }
        });

        // Initialize services
        lobbyService = new LobbyService();
        gameService = new GameService();
        lobbyManager = new LobbyManager(lobbyService, io);
        gameManager = new GameManager(gameService, io);

        // Start server
        await new Promise((resolve) => {
            httpServer.listen(0, resolve);
        });

        clientSockets = [];
    });

    afterAll(async () => {
        // Cleanup all client sockets
        clientSockets.forEach(socket => socket.disconnect());

        // Close server
        io.close();
        httpServer.close();
    });

    beforeEach(() => {
        // Clear any existing game state
        lobbyManager.clearAllLobbies();
        gameManager.clearAllGames();
    });

    afterEach(() => {
        // Disconnect any sockets created during test
        clientSockets.forEach(socket => socket.disconnect());
        clientSockets.length = 0;
    });

    describe('Complete Game Flow', () => {
        test('should handle full game session from lobby creation to completion', async () => {
            // Arrange
            const host = global.testUtils.createMockUser({ id: 'host123', name: 'Host Player' });
            const players = [
                global.testUtils.createMockUser({ id: 'player1', name: 'Player 1' }),
                global.testUtils.createMockUser({ id: 'player2', name: 'Player 2' }),
                global.testUtils.createMockUser({ id: 'player3', name: 'Player 3' })
            ];

            // Create mock sockets for each player
            const hostSocket = socketHelpers.createMockSocketWithEvents({ id: 'host-socket' });
            const playerSockets = players.map((player, index) =>
                socketHelpers.createMockSocketWithEvents({ id: `player-socket-${index}` })
            );

            clientSockets.push(hostSocket, ...playerSockets);

            // Step 1: Host creates lobby
            const lobbyData = {
                name: 'Integration Test Lobby',
                maxPlayers: 4,
                settings: {
                    categories: ['general'],
                    questionCount: 5,
                    timePerQuestion: 10
                }
            };

            const lobby = await lobbyService.createLobby(host, lobbyData);
            expect(lobby).toHaveProperty('id');
            expect(lobby.hostId).toBe(host.id);

            // Step 2: Players join lobby
            for (let i = 0; i < players.length; i++) {
                const updatedLobby = await lobbyService.joinLobby(lobby.id, players[i]);
                expect(updatedLobby.players).toHaveLength(i + 2); // +1 for host, +1 for current player
            }

            // Step 3: Host starts game
            const game = await gameService.createGame(lobby.id, lobby.settings);
            expect(game).toHaveProperty('id');
            expect(game.lobbyId).toBe(lobby.id);
            expect(game.state).toBe('waiting');

            // Step 4: Start first question
            const startedGame = await gameService.startGame(game.id);
            expect(startedGame.state).toBe('question');
            expect(startedGame.currentQuestionIndex).toBe(0);

            // Step 5: Players submit answers
            const question = startedGame.questions[0];
            const answers = [
                { playerId: host.id, answer: question.correctAnswer, timeToAnswer: 5 },
                { playerId: players[0].id, answer: question.correctAnswer, timeToAnswer: 7 },
                { playerId: players[1].id, answer: (question.correctAnswer + 1) % 4, timeToAnswer: 8 },
                { playerId: players[2].id, answer: question.correctAnswer, timeToAnswer: 9 }
            ];

            for (const answer of answers) {
                await gameService.submitAnswer(game.id, answer.playerId, answer.answer, answer.timeToAnswer);
            }

            // Step 6: Move to results phase
            const gameWithResults = await gameService.showResults(game.id);
            expect(gameWithResults.state).toBe('results');

            // Step 7: Continue through all questions
            for (let questionIndex = 1; questionIndex < lobby.settings.questionCount; questionIndex++) {
                const nextQuestion = await gameService.nextQuestion(game.id);
                expect(nextQuestion.currentQuestionIndex).toBe(questionIndex);

                // Submit random answers for each question
                const currentQuestion = nextQuestion.questions[questionIndex];
                for (let playerIndex = 0; playerIndex < 4; playerIndex++) { // 4 total players including host
                    const playerId = playerIndex === 0 ? host.id : players[playerIndex - 1].id;
                    const randomAnswer = Math.floor(Math.random() * 4);
                    const randomTime = Math.floor(Math.random() * 8) + 2; // 2-10 seconds

                    await gameService.submitAnswer(game.id, playerId, randomAnswer, randomTime);
                }

                await gameService.showResults(game.id);
            }

            // Step 8: Complete game
            const completedGame = await gameService.completeGame(game.id);
            expect(completedGame.state).toBe('completed');
            expect(completedGame).toHaveProperty('finalScores');
            expect(completedGame).toHaveProperty('rankings');

            // Verify final scores are calculated correctly
            expect(Object.keys(completedGame.finalScores)).toHaveLength(4);
            expect(completedGame.rankings).toHaveLength(4);
            expect(completedGame.rankings[0]).toHaveProperty('rank', 1);
        }, 30000); // 30 second timeout for integration test

        test('should handle player disconnection during game', async () => {
            // Arrange
            const { lobby, game } = gameHelpers.createGameState({ playerCount: 3 });
            const createdLobby = await lobbyService.createLobby(
                global.testUtils.createMockUser({ id: lobby.hostId }),
                lobby
            );

            // Add players to lobby
            for (const player of lobby.players.slice(1)) { // Skip host
                await lobbyService.joinLobby(createdLobby.id, player);
            }

            // Start game
            const createdGame = await gameService.createGame(createdLobby.id, lobby.settings);
            const startedGame = await gameService.startGame(createdGame.id);

            // Act - Simulate player disconnection
            const disconnectedPlayerId = lobby.players[1].id;
            await lobbyService.handlePlayerDisconnect(createdLobby.id, disconnectedPlayerId);

            // Continue game with remaining players
            const question = startedGame.questions[0];
            const remainingPlayers = lobby.players.filter(p => p.id !== disconnectedPlayerId);

            for (const player of remainingPlayers) {
                await gameService.submitAnswer(createdGame.id, player.id, question.correctAnswer, 5);
            }

            const gameWithResults = await gameService.showResults(createdGame.id);

            // Assert
            expect(gameWithResults.disconnectedPlayers).toContain(disconnectedPlayerId);
            expect(Object.keys(gameWithResults.currentAnswers)).toHaveLength(remainingPlayers.length);
        });

        test('should handle host transfer during active game', async () => {
            // Arrange
            const { lobby } = gameHelpers.createGameState({ playerCount: 4 });
            const originalHostId = lobby.hostId;
            const newHostId = lobby.players[1].id;

            const createdLobby = await lobbyService.createLobby(
                global.testUtils.createMockUser({ id: originalHostId }),
                lobby
            );

            // Start game
            const createdGame = await gameService.createGame(createdLobby.id, lobby.settings);
            await gameService.startGame(createdGame.id);

            // Act - Transfer host
            const updatedLobby = await lobbyService.transferHost(
                createdLobby.id,
                originalHostId,
                newHostId
            );

            // Assert
            expect(updatedLobby.hostId).toBe(newHostId);

            // Verify new host can control game
            const gameState = await gameService.getGame(createdGame.id);
            expect(gameState).toBeDefined();

            // New host should be able to pause/resume game
            await gameService.pauseGame(createdGame.id, newHostId);
            const pausedGame = await gameService.getGame(createdGame.id);
            expect(pausedGame.state).toBe('paused');
        });
    });

    describe('Socket.IO Integration', () => {
        test('should broadcast lobby updates to all players', async () => {
            // Arrange
            const host = global.testUtils.createMockUser({ id: 'host123' });
            const player = global.testUtils.createMockUser({ id: 'player456' });

            const hostSocket = socketHelpers.createMockSocketWithEvents();
            const playerSocket = socketHelpers.createMockSocketWithEvents();
            clientSockets.push(hostSocket, playerSocket);

            // Create lobby
            const lobby = await lobbyService.createLobby(host, {
                name: 'Socket Test Lobby',
                maxPlayers: 4,
                settings: { categories: ['general'], questionCount: 10, timePerQuestion: 30 }
            });

            // Act - Player joins lobby
            await lobbyService.joinLobby(lobby.id, player);

            // Assert - Both sockets should receive lobby update
            await global.testUtils.waitFor(() => {
                return hostSocket.emit.mock.calls.some(call =>
                    call[0] === 'lobbyUpdated' && call[1].lobby.players.length === 2
                );
            });

            expect(playerSocket.emit).toHaveBeenCalledWith(
                'lobbyJoined',
                expect.objectContaining({
                    lobby: expect.objectContaining({
                        id: lobby.id,
                        players: expect.arrayContaining([
                            expect.objectContaining({ id: host.id }),
                            expect.objectContaining({ id: player.id })
                        ])
                    })
                })
            );
        });

        test('should handle real-time game events', async () => {
            // Arrange
            const { lobby, game } = gameHelpers.createGameState({ playerCount: 2 });
            const hostSocket = socketHelpers.createMockSocketWithEvents();
            const playerSocket = socketHelpers.createMockSocketWithEvents();
            clientSockets.push(hostSocket, playerSocket);

            // Create and start game
            const createdLobby = await lobbyService.createLobby(
                global.testUtils.createMockUser({ id: lobby.hostId }),
                lobby
            );
            const createdGame = await gameService.createGame(createdLobby.id, lobby.settings);
            const startedGame = await gameService.startGame(createdGame.id);

            // Act - Submit answer from player
            const question = startedGame.questions[0];
            await gameService.submitAnswer(
                createdGame.id,
                lobby.players[1].id,
                question.correctAnswer,
                8
            );

            // Assert - Host should be notified of answer submission
            await global.testUtils.waitFor(() => {
                return hostSocket.emit.mock.calls.some(call =>
                    call[0] === 'answerSubmitted' &&
                    call[1].playerId === lobby.players[1].id
                );
            });

            expect(hostSocket.emit).toHaveBeenCalledWith(
                'answerSubmitted',
                expect.objectContaining({
                    playerId: lobby.players[1].id,
                    hasAnswered: true
                })
            );
        });

        test('should handle socket disconnection gracefully', async () => {
            // Arrange
            const host = global.testUtils.createMockUser({ id: 'host123' });
            const player = global.testUtils.createMockUser({ id: 'player456' });

            const hostSocket = socketHelpers.createMockSocketWithEvents({ id: 'host-socket' });
            const playerSocket = socketHelpers.createMockSocketWithEvents({ id: 'player-socket' });
            clientSockets.push(hostSocket, playerSocket);

            const lobby = await lobbyService.createLobby(host, {
                name: 'Disconnect Test',
                maxPlayers: 4,
                settings: { categories: ['general'], questionCount: 5, timePerQuestion: 30 }
            });

            await lobbyService.joinLobby(lobby.id, player);

            // Act - Simulate socket disconnection
            playerSocket.disconnect();

            // Simulate the disconnection handling
            await lobbyService.handlePlayerDisconnect(lobby.id, player.id);

            // Assert - Host should be notified of player disconnection
            await global.testUtils.waitFor(() => {
                return hostSocket.emit.mock.calls.some(call =>
                    call[0] === 'playerDisconnected' &&
                    call[1].playerId === player.id
                );
            });
        });
    });

    describe('Error Handling Integration', () => {
        test('should handle cascading errors across services', async () => {
            // Arrange
            const host = global.testUtils.createMockUser({ id: 'host123' });

            // Create lobby
            const lobby = await lobbyService.createLobby(host, {
                name: 'Error Test Lobby',
                maxPlayers: 2,
                settings: { categories: ['general'], questionCount: 5, timePerQuestion: 30 }
            });

            // Start game
            const game = await gameService.createGame(lobby.id, lobby.settings);

            // Act - Try to start game with insufficient players
            let errorThrown = false;
            try {
                await gameService.startGame(game.id);
            } catch (error) {
                errorThrown = true;
                expect(error.message).toContain('minimum players');
            }

            // Assert
            expect(errorThrown).toBe(true);

            // Verify game state is still valid
            const gameState = await gameService.getGame(game.id);
            expect(gameState.state).toBe('waiting');
        });

        test('should recover from temporary service failures', async () => {
            // Arrange
            const { lobby } = gameHelpers.createGameState({ playerCount: 3 });

            const createdLobby = await lobbyService.createLobby(
                global.testUtils.createMockUser({ id: lobby.hostId }),
                lobby
            );

            // Simulate temporary database failure
            const originalMethod = lobbyService.getLobby;
            let failureCount = 0;
            lobbyService.getLobby = jest.fn().mockImplementation((lobbyId) => {
                failureCount++;
                if (failureCount <= 2) {
                    throw new Error('Temporary database failure');
                }
                return originalMethod.call(lobbyService, lobbyId);
            });

            // Act - Retry logic should eventually succeed
            let result;
            for (let attempt = 0; attempt < 5; attempt++) {
                try {
                    result = await lobbyService.getLobby(createdLobby.id);
                    break;
                } catch (error) {
                    if (attempt === 4) throw error; // Re-throw on final attempt
                    await global.testUtils.wait(100); // Wait before retry
                }
            }

            // Assert
            expect(result).toBeDefined();
            expect(result.id).toBe(createdLobby.id);
            expect(failureCount).toBe(3); // Should have failed twice, then succeeded

            // Restore original method
            lobbyService.getLobby = originalMethod;
        });
    });

    describe('Performance Integration Tests', () => {
        test('should handle multiple concurrent lobby operations', async () => {
            // Arrange
            const hostCount = 10;
            const hosts = Array.from({ length: hostCount }, (_, i) =>
                global.testUtils.createMockUser({ id: `host${i}` })
            );

            // Act - Create multiple lobbies concurrently
            const start = Date.now();
            const lobbyPromises = hosts.map(host =>
                lobbyService.createLobby(host, {
                    name: `Concurrent Lobby ${host.id}`,
                    maxPlayers: 4,
                    settings: { categories: ['general'], questionCount: 10, timePerQuestion: 30 }
                })
            );

            const lobbies = await Promise.all(lobbyPromises);
            const duration = Date.now() - start;

            // Assert
            expect(lobbies).toHaveLength(hostCount);
            expect(duration).