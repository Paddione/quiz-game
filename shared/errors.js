/**
 * @fileoverview Comprehensive error handling system for the Quiz Game application.
 * Provides custom error classes, error factories, and error handling utilities.
 *
 * @author Quiz Game Team
 * @version 1.0.0
 */

import { ERROR_CODES, HTTP_STATUS } from './constants.js';

// ═══════════════════════════════════════════════════════════════════════════
// CUSTOM ERROR CLASSES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Base application error class
 */
export class AppError extends Error {
    constructor(message, code = ERROR_CODES.INTERNAL_ERROR, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, details = null) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        this.timestamp = new Date().toISOString();
        this.isOperational = true;

        // Maintains proper stack trace for where our error was thrown
        Error.captureStackTrace(this, this.constructor);
    }

    /**
     * Converts error to JSON format for API responses
     * @returns {Object} JSON representation of the error
     */
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            statusCode: this.statusCode,
            details: this.details,
            timestamp: this.timestamp
        };
    }

    /**
     * Creates a client-safe version of the error (excludes sensitive info)
     * @returns {Object} Client-safe error object
     */
    toClientError() {
        return {
            code: this.code,
            message: this.message,
            details: this.details
        };
    }
}

/**
 * Validation error class
 */
export class ValidationError extends AppError {
    constructor(message, field = null, details = null) {
        super(message, ERROR_CODES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST, details);
        this.field = field;
    }

    toClientError() {
        return {
            ...super.toClientError(),
            field: this.field
        };
    }
}

/**
 * Authentication error class
 */
export class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed', details = null) {
        super(message, ERROR_CODES.AUTH_ERROR, HTTP_STATUS.UNAUTHORIZED, details);
    }
}

/**
 * Authorization error class
 */
export class AuthorizationError extends AppError {
    constructor(message = 'Access denied', details = null) {
        super(message, ERROR_CODES.UNAUTHORIZED, HTTP_STATUS.FORBIDDEN, details);
    }
}

/**
 * Lobby-related error class
 */
export class LobbyError extends AppError {
    constructor(message, code = ERROR_CODES.LOBBY_ERROR, details = null) {
        const statusCode = getLobbyErrorStatusCode(code);
        super(message, code, statusCode, details);
    }
}

/**
 * Game-related error class
 */
export class GameError extends AppError {
    constructor(message, code = ERROR_CODES.GAME_ERROR, details = null) {
        const statusCode = getGameErrorStatusCode(code);
        super(message, code, statusCode, details);
    }
}

/**
 * Question-related error class
 */
export class QuestionError extends AppError {
    constructor(message, code = ERROR_CODES.QUESTION_ERROR, details = null) {
        const statusCode = getQuestionErrorStatusCode(code);
        super(message, code, statusCode, details);
    }
}

/**
 * Rate limiting error class
 */
export class RateLimitError extends AppError {
    constructor(message = 'Rate limit exceeded', retryAfter = 60, details = null) {
        super(message, ERROR_CODES.RATE_LIMIT_EXCEEDED, HTTP_STATUS.TOO_MANY_REQUESTS, details);
        this.retryAfter = retryAfter;
    }

    toClientError() {
        return {
            ...super.toClientError(),
            retryAfter: this.retryAfter
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// ERROR FACTORY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Creates validation errors
 */
export const ValidationErrors = {
    invalidInput: (field, value) => new ValidationError(
        `Invalid value for field '${field}': ${value}`,
        field
    ),

    missingField: (field) => new ValidationError(
        `Required field '${field}' is missing`,
        field
    ),

    fieldTooLong: (field, maxLength) => new ValidationError(
        `Field '${field}' exceeds maximum length of ${maxLength} characters`,
        field
    ),

    fieldTooShort: (field, minLength) => new ValidationError(
        `Field '${field}' must be at least ${minLength} characters`,
        field
    ),

    invalidFormat: (field, expectedFormat) => new ValidationError(
        `Field '${field}' has invalid format. Expected: ${expectedFormat}`,
        field
    ),

    invalidRange: (field, min, max) => new ValidationError(
        `Field '${field}' must be between ${min} and ${max}`,
        field
    ),

    invalidChoice: (field, allowedValues) => new ValidationError(
        `Field '${field}' must be one of: ${allowedValues.join(', ')}`,
        field
    )
};

/**
 * Creates authentication errors
 */
export const AuthErrors = {
    invalidToken: () => new AuthenticationError(
        'Invalid or expired authentication token',
        { code: ERROR_CODES.INVALID_TOKEN }
    ),

    tokenExpired: () => new AuthenticationError(
        'Authentication token has expired',
        { code: ERROR_CODES.TOKEN_EXPIRED }
    ),

    missingToken: () => new AuthenticationError(
        'Authentication token is required',
        { code: ERROR_CODES.AUTH_ERROR }
    ),

    invalidCredentials: () => new AuthenticationError(
        'Invalid email or password',
        { code: ERROR_CODES.AUTH_ERROR }
    ),

    accountLocked: (unlockTime) => new AuthenticationError(
        'Account is temporarily locked due to failed login attempts',
        { unlockTime }
    )
};

/**
 * Creates lobby errors
 */
export const LobbyErrors = {
    notFound: (lobbyId) => new LobbyError(
        `Lobby '${lobbyId}' not found`,
        ERROR_CODES.LOBBY_NOT_FOUND
    ),

    full: (lobbyId) => new LobbyError(
        `Lobby '${lobbyId}' is full`,
        ERROR_CODES.LOBBY_FULL
    ),

    closed: (lobbyId) => new LobbyError(
        `Lobby '${lobbyId}' is closed`,
        ERROR_CODES.LOBBY_CLOSED
    ),

    invalidPassword: () => new LobbyError(
        'Invalid lobby password',
        ERROR_CODES.INVALID_PASSWORD
    ),

    alreadyInLobby: (playerId) => new LobbyError(
        `Player '${playerId}' is already in a lobby`,
        ERROR_CODES.ALREADY_IN_LOBBY
    ),

    notInLobby: (playerId) => new LobbyError(
        `Player '${playerId}' is not in a lobby`,
        ERROR_CODES.NOT_IN_LOBBY
    ),

    notHost: (playerId) => new LobbyError(
        `Player '${playerId}' is not the lobby host`,
        ERROR_CODES.NOT_HOST
    ),

    cannotKickHost: () => new LobbyError(
        'Cannot kick the lobby host',
        ERROR_CODES.LOBBY_ERROR
    )
};

/**
 * Creates game errors
 */
export const GameErrors = {
    notFound: (gameId) => new GameError(
        `Game '${gameId}' not found`,
        ERROR_CODES.GAME_NOT_FOUND
    ),

    alreadyStarted: (gameId) => new GameError(
        `Game '${gameId}' has already started`,
        ERROR_CODES.GAME_ALREADY_STARTED
    ),

    notStarted: (gameId) => new GameError(
        `Game '${gameId}' has not started yet`,
        ERROR_CODES.GAME_NOT_STARTED
    ),

    invalidAnswer: (questionId) => new GameError(
        `Invalid answer for question '${questionId}'`,
        ERROR_CODES.INVALID_ANSWER
    ),

    alreadyAnswered: (questionId, playerId) => new GameError(
        `Player '${playerId}' has already answered question '${questionId}'`,
        ERROR_CODES.ALREADY_ANSWERED
    ),

    timeExpired: (questionId) => new GameError(
        `Time expired for question '${questionId}'`,
        ERROR_CODES.TIME_EXPIRED
    ),

    notEnoughPlayers: (required, actual) => new GameError(
        `Not enough players to start game. Required: ${required}, Available: ${actual}`,
        ERROR_CODES.GAME_ERROR
    ),

    powerupNotAvailable: (powerupType) => new GameError(
        `Powerup '${powerupType}' is not available`,
        ERROR_CODES.GAME_ERROR
    ),

    insufficientPoints: (required, available) => new GameError(
        `Insufficient points. Required: ${required}, Available: ${available}`,
        ERROR_CODES.GAME_ERROR
    )
};

/**
 * Creates question errors
 */
export const QuestionErrors = {
    notFound: (questionId) => new QuestionError(
        `Question '${questionId}' not found`,
        ERROR_CODES.QUESTIONS_NOT_FOUND
    ),

    invalidCategory: (category) => new QuestionError(
        `Invalid question category: '${category}'`,
        ERROR_CODES.INVALID_CATEGORY
    ),

    invalidDifficulty: (difficulty) => new QuestionError(
        `Invalid difficulty level: '${difficulty}'`,
        ERROR_CODES.INVALID_DIFFICULTY
    ),

    insufficientQuestions: (requested, available) => new QuestionError(
        `Not enough questions available. Requested: ${requested}, Available: ${available}`,
        ERROR_CODES.QUESTIONS_NOT_FOUND
    ),

    loadingFailed: (reason) => new QuestionError(
        `Failed to load questions: ${reason}`,
        ERROR_CODES.QUESTION_ERROR
    )
};

// ═══════════════════════════════════════════════════════════════════════════
// ERROR HANDLING UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Determines if an error is operational (expected) or programming error
 * @param {Error} error - Error to check
 * @returns {boolean} True if error is operational
 */
export function isOperationalError(error) {
    return error instanceof AppError && error.isOperational;
}

/**
 * Express error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export function errorHandler(err, req, res, next) {
    // Log error for debugging
    console.error('Error:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
    });

    // Handle operational errors
    if (isOperationalError(err)) {
        return res.status(err.statusCode).json({
            success: false,
            error: err.toClientError()
        });
    }

    // Handle Zod validation errors
    if (err.name === 'ZodError') {
        const validationError = new ValidationError('Validation failed', null, {
            issues: err.errors
        });
        return res.status(validationError.statusCode).json({
            success: false,
            error: validationError.toClientError()
        });
    }

    // Handle unknown errors
    const genericError = {
        code: ERROR_CODES.INTERNAL_ERROR,
        message: 'An unexpected error occurred'
    };

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: genericError
    });
}

/**
 * Socket.IO error handler
 * @param {Object} socket - Socket.IO socket
 * @param {Error} error - Error object
 * @param {Function} callback - Optional callback function
 */
export function handleSocketError(socket, error, callback = null) {
    console.error('Socket error:', {
        socketId: socket.id,
        message: error.message,
        timestamp: new Date().toISOString()
    });

    const errorResponse = {
        success: false,
        error: isOperationalError(error)
            ? error.toClientError()
            : { code: ERROR_CODES.INTERNAL_ERROR, message: 'An unexpected error occurred' }
    };

    if (callback) {
        callback(errorResponse);
    } else {
        socket.emit('error', errorResponse);
    }
}

/**
 * Async wrapper for express routes that catches errors
 * @param {Function} fn - Async route handler
 * @returns {Function} Wrapped route handler
 */
export function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

/**
 * Creates a safe version of an async function that returns errors instead of throwing
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Safe version of the function
 */
export function safeAsync(fn) {
    return async (...args) => {
        try {
            const result = await fn(...args);
            return { success: true, data: result, error: null };
        } catch (error) {
            return { success: false, data: null, error };
        }
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Maps lobby error codes to HTTP status codes
 * @param {string} code - Error code
 * @returns {number} HTTP status code
 */
function getLobbyErrorStatusCode(code) {
    const statusMap = {
        [ERROR_CODES.LOBBY_NOT_FOUND]: HTTP_STATUS.NOT_FOUND,
        [ERROR_CODES.LOBBY_FULL]: HTTP_STATUS.CONFLICT,
        [ERROR_CODES.LOBBY_CLOSED]: HTTP_STATUS.CONFLICT,
        [ERROR_CODES.INVALID_PASSWORD]: HTTP_STATUS.UNAUTHORIZED,
        [ERROR_CODES.ALREADY_IN_LOBBY]: HTTP_STATUS.CONFLICT,
        [ERROR_CODES.NOT_IN_LOBBY]: HTTP_STATUS.BAD_REQUEST,
        [ERROR_CODES.NOT_HOST]: HTTP_STATUS.FORBIDDEN
    };

    return statusMap[code] || HTTP_STATUS.BAD_REQUEST;
}

/**
 * Maps game error codes to HTTP status codes
 * @param {string} code - Error code
 * @returns {number} HTTP status code
 */
function getGameErrorStatusCode(code) {
    const statusMap = {
        [ERROR_CODES.GAME_NOT_FOUND]: HTTP_STATUS.NOT_FOUND,
        [ERROR_CODES.GAME_ALREADY_STARTED]: HTTP_STATUS.CONFLICT,
        [ERROR_CODES.GAME_NOT_STARTED]: HTTP_STATUS.CONFLICT,
        [ERROR_CODES.INVALID_ANSWER]: HTTP_STATUS.BAD_REQUEST,
        [ERROR_CODES.ALREADY_ANSWERED]: HTTP_STATUS.CONFLICT,
        [ERROR_CODES.TIME_EXPIRED]: HTTP_STATUS.BAD_REQUEST
    };

    return statusMap[code] || HTTP_STATUS.BAD_REQUEST;
}

/**
 * Maps question error codes to HTTP status codes
 * @param {string} code - Error code
 * @returns {number} HTTP status code
 */
function getQuestionErrorStatusCode(code) {
    const statusMap = {
        [ERROR_CODES.QUESTIONS_NOT_FOUND]: HTTP_STATUS.NOT_FOUND,
        [ERROR_CODES.INVALID_CATEGORY]: HTTP_STATUS.BAD_REQUEST,
        [ERROR_CODES.INVALID_DIFFICULTY]: HTTP_STATUS.BAD_REQUEST
    };

    return statusMap[code] || HTTP_STATUS.BAD_REQUEST;
}

// Export all error classes and utilities
export default {
    // Error classes
    AppError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    LobbyError,
    GameError,
    QuestionError,
    RateLimitError,

    // Error factories
    ValidationErrors,
    AuthErrors,
    LobbyErrors,
    GameErrors,
    QuestionErrors,

    // Utilities
    isOperationalError,
    errorHandler,
    handleSocketError,
    asyncHandler,
    safeAsync
};