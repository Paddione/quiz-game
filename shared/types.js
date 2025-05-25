/**
 * @fileoverview JSDoc type definitions for the Quiz Game application.
 * This file provides TypeScript-like type safety through JSDoc comments.
 *
 * @author Quiz Game Team
 * @version 1.0.0
 */

/**
 * @typedef {Object} User
 * @property {string} id - Unique user identifier
 * @property {string} name - Display name
 * @property {string} email - User email address
 * @property {boolean} isGuest - Whether user is a guest or registered
 * @property {string} avatarUrl - URL to user's avatar image
 * @property {Date} createdAt - Account creation date
 * @property {Date} lastActiveAt - Last activity timestamp
 */

/**
 * @typedef {Object} Player
 * @property {string} id - Player identifier (same as user ID)
 * @property {string} name - Player display name
 * @property {number} score - Current game score
 * @property {boolean} isHost - Whether player is the lobby host
 * @property {boolean} isReady - Whether player is ready to start
 * @property {string} connectionId - Socket connection identifier
 * @property {Date} joinedAt - When player joined the lobby
 * @property {number} streak - Current correct answer streak
 * @property {number} totalCorrect - Total correct answers in session
 * @property {number} averageResponseTime - Average response time in ms
 */

/**
 * @typedef {Object} Lobby
 * @property {string} id - Unique lobby identifier
 * @property {string} name - Lobby display name
 * @property {string} hostId - ID of the lobby host
 * @property {Player[]} players - Array of players in the lobby
 * @property {LobbySettings} settings - Lobby configuration settings
 * @property {LobbyStatus} status - Current lobby status
 * @property {Date} createdAt - Lobby creation timestamp
 * @property {Date} lastActivityAt - Last activity in lobby
 * @property {string|null} gameId - ID of active game session, if any
 * @property {number} maxPlayers - Maximum allowed players
 * @property {boolean} isPrivate - Whether lobby requires invitation
 * @property {string|null} password - Lobby password for private lobbies
 */

/**
 * @typedef {Object} LobbySettings
 * @property {string} category - Question category
 * @property {string} difficulty - Question difficulty level
 * @property {number} questionCount - Number of questions per game
 * @property {number} timePerQuestion - Time limit per question in seconds
 * @property {boolean} showCorrectAnswers - Whether to show correct answers
 * @property {boolean} allowSpectators - Whether to allow spectators
 * @property {number} pointsPerCorrect - Points awarded for correct answers
 * @property {number} speedBonus - Bonus points for fast answers
 * @property {boolean} enablePowerups - Whether powerups are enabled
 */

/**
 * @typedef {'waiting'|'starting'|'active'|'finished'|'abandoned'} LobbyStatus
 */

/**
 * @typedef {Object} Game
 * @property {string} id - Unique game identifier
 * @property {string} lobbyId - Associated lobby ID
 * @property {Question[]} questions - Array of game questions
 * @property {number} currentQuestionIndex - Index of current question
 * @property {GameStatus} status - Current game status
 * @property {Date} startedAt - Game start timestamp
 * @property {Date|null} endedAt - Game end timestamp
 * @property {GameResults|null} results - Final game results
 * @property {Object.<string, PlayerGameState>} playerStates - Player-specific game state
 * @property {Timer} timer - Current question timer
 * @property {LobbySettings} settings - Game settings (copied from lobby)
 */

/**
 * @typedef {'preparing'|'question'|'answering'|'revealing'|'finished'|'paused'} GameStatus
 */

/**
 * @typedef {Object} PlayerGameState
 * @property {string} playerId - Player identifier
 * @property {string|null} currentAnswer - Player's current answer
 * @property {number} responseTime - Time taken to answer in ms
 * @property {boolean} hasAnswered - Whether player has submitted answer
 * @property {number} sessionScore - Total score for this game session
 * @property {number} streak - Current correct answer streak
 * @property {PowerUp[]} powerUps - Available powerups
 * @property {boolean} isSpectating - Whether player is spectating
 */

/**
 * @typedef {Object} Question
 * @property {string} id - Unique question identifier
 * @property {string} text - Question text
 * @property {string[]} options - Array of answer options
 * @property {number} correctIndex - Index of correct answer (0-based)
 * @property {string} category - Question category
 * @property {string} difficulty - Question difficulty
 * @property {number} timeLimit - Time limit for this question in seconds
 * @property {string|null} imageUrl - Optional image URL
 * @property {string|null} explanation - Optional explanation text
 * @property {number} points - Points awarded for correct answer
 */

/**
 * @typedef {Object} Answer
 * @property {string} playerId - Player who submitted the answer
 * @property {string} questionId - Question being answered
 * @property {number} selectedIndex - Selected answer index
 * @property {number} responseTime - Time taken to answer in ms
 * @property {boolean} isCorrect - Whether answer is correct
 * @property {number} pointsEarned - Points earned for this answer
 * @property {Date} submittedAt - Answer submission timestamp
 */

/**
 * @typedef {Object} Timer
 * @property {number} duration - Total timer duration in seconds
 * @property {number} remaining - Remaining time in seconds
 * @property {boolean} isActive - Whether timer is currently running
 * @property {Date|null} startedAt - Timer start timestamp
 * @property {Date|null} endsAt - Timer end timestamp
 */

/**
 * @typedef {Object} GameResults
 * @property {PlayerResult[]} playerResults - Results for each player
 * @property {string} winnerId - ID of winning player
 * @property {Date} completedAt - Game completion timestamp
 * @property {number} totalQuestions - Total questions in game
 * @property {number} averageScore - Average score across all players
 * @property {GameStatistics} statistics - Game statistics
 */

/**
 * @typedef {Object} PlayerResult
 * @property {string} playerId - Player identifier
 * @property {string} playerName - Player display name
 * @property {number} finalScore - Final score
 * @property {number} correctAnswers - Number of correct answers
 * @property {number} totalAnswers - Total answers submitted
 * @property {number} averageResponseTime - Average response time in ms
 * @property {number} maxStreak - Maximum correct answer streak
 * @property {number} rank - Final ranking (1-based)
 * @property {number} pointsFromSpeed - Points earned from speed bonus
 * @property {number} pointsFromCorrectness - Points earned from correct answers
 */

/**
 * @typedef {Object} GameStatistics
 * @property {number} totalPlayTime - Total game duration in seconds
 * @property {number} questionsCompleted - Number of questions completed
 * @property {Object.<string, number>} categoryBreakdown - Correct answers by category
 * @property {number} averageResponseTime - Average response time across all players
 * @property {string} mostMissedQuestion - ID of most frequently missed question
 * @property {string} fastestAnswer - ID of fastest answered question
 */

/**
 * @typedef {Object} PowerUp
 * @property {string} id - Unique powerup identifier
 * @property {PowerUpType} type - Type of powerup
 * @property {string} name - Display name
 * @property {string} description - Powerup description
 * @property {number} cost - Cost in points to use
 * @property {boolean} isUsed - Whether powerup has been used
 * @property {Object} effects - Powerup effects configuration
 */

/**
 * @typedef {'freeze'|'double-points'|'skip'|'fifty-fifty'|'extra-time'} PowerUpType
 */

/**
 * @typedef {Object} SocketEvent
 * @property {string} type - Event type identifier
 * @property {Object} payload - Event data payload
 * @property {string} playerId - ID of player who triggered event
 * @property {Date} timestamp - Event timestamp
 * @property {string|null} lobbyId - Associated lobby ID
 * @property {string|null} gameId - Associated game ID
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Whether the request was successful
 * @property {Object|null} data - Response data
 * @property {ApiError|null} error - Error information if request failed
 * @property {Object|null} meta - Additional metadata
 */

/**
 * @typedef {Object} ApiError
 * @property {string} code - Error code identifier
 * @property {string} message - Human-readable error message
 * @property {string|null} field - Field that caused validation error
 * @property {Object|null} details - Additional error details
 */

/**
 * @typedef {Object} ValidationSchema
 * @property {string} field - Field name being validated
 * @property {string[]} rules - Array of validation rules
 * @property {boolean} required - Whether field is required
 * @property {Object|null} options - Additional validation options
 */

/**
 * @typedef {Object} GameConfiguration
 * @property {string[]} categories - Available question categories
 * @property {string[]} difficulties - Available difficulty levels
 * @property {Object} timeouts - Various timeout configurations
 * @property {Object} scoring - Scoring system configuration
 * @property {Object} limits - System limits and boundaries
 */

/**
 * @typedef {Object} UserSession
 * @property {string} sessionId - Unique session identifier
 * @property {string} userId - Associated user ID
 * @property {string} token - Authentication token
 * @property {Date} createdAt - Session creation timestamp
 * @property {Date} expiresAt - Session expiration timestamp
 * @property {string} ipAddress - Client IP address
 * @property {string} userAgent - Client user agent
 */

/**
 * @typedef {Object} LeaderboardEntry
 * @property {string} playerId - Player identifier
 * @property {string} playerName - Player display name
 * @property {number} totalGames - Total games played
 * @property {number} totalWins - Total games won
 * @property {number} averageScore - Average score across all games
 * @property {number} bestScore - Highest single game score
 * @property {number} totalPlayTime - Total time spent playing in seconds
 * @property {Date} lastPlayed - Last game played timestamp
 * @property {number} rank - Current leaderboard rank
 * @property {number} winRate - Win percentage (0-100)
 */

export {
    // Type definitions are for JSDoc only, no actual exports needed
    // This file serves as a reference for TypeScript-like typing in JavaScript
};