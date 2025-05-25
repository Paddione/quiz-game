/**
 * @fileoverview Zod validation schemas for the Quiz Game application.
 * Provides centralized validation logic for all data types.
 *
 * @author Quiz Game Team
 * @version 1.0.0
 */

import { z } from 'zod';
import {
    MIN_NAME_LENGTH,
    MAX_NAME_LENGTH,
    MAX_PASSWORD_LENGTH,
    MIN_PLAYERS_TO_START,
    MAX_PLAYERS_PER_LOBBY,
    DEFAULT_QUESTION_COUNT,
    MAX_QUESTION_COUNT,
    MIN_TIME_PER_QUESTION,
    MAX_TIME_PER_QUESTION,
    QUESTION_CATEGORIES,
    DIFFICULTY_LEVELS,
    LOBBY_STATUS,
    GAME_STATUS,
    POWERUP_TYPES,
    ERROR_CODES
} from './constants.js';

// ═══════════════════════════════════════════════════════════════════════════
// BASIC DATA TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Validation schema for user ID
 */
export const userIdSchema = z.string()
    .min(1, 'User ID cannot be empty')
    .max(128, 'User ID too long');

/**
 * Validation schema for player/lobby names
 */
export const nameSchema = z.string()
    .min(MIN_NAME_LENGTH, `Name must be at least ${MIN_NAME_LENGTH} characters`)
    .max(MAX_NAME_LENGTH, `Name cannot exceed ${MAX_NAME_LENGTH} characters`)
    .regex(/^[a-zA-Z0-9\s\-_äöüßÄÖÜ]+$/, 'Name contains invalid characters')
    .transform(name => name.trim());

/**
 * Validation schema for email addresses
 */
export const emailSchema = z.string()
    .email('Invalid email address')
    .max(254, 'Email address too long')
    .transform(email => email.toLowerCase().trim());

/**
 * Validation schema for passwords
 */
export const passwordSchema = z.string()
    .min(1, 'Password cannot be empty')
    .max(MAX_PASSWORD_LENGTH, `Password cannot exceed ${MAX_PASSWORD_LENGTH} characters`)
    .optional();

/**
 * Validation schema for lobby IDs
 */
export const lobbyIdSchema = z.string()
    .length(6, 'Lobby ID must be exactly 6 characters')
    .regex(/^[A-Z0-9]+$/, 'Lobby ID contains invalid characters');

/**
 * Validation schema for game IDs
 */
export const gameIdSchema = z.string()
    .uuid('Invalid game ID format');

// ═══════════════════════════════════════════════════════════════════════════
// USER & AUTHENTICATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Schema for user registration/login
 */
export const userSchema = z.object({
    id: userIdSchema,
    name: nameSchema,
    email: emailSchema.optional(),
    isGuest: z.boolean().default(false),
    avatarUrl: z.string().url().optional(),
    createdAt: z.date().optional(),
    lastActiveAt: z.date().optional()
});

/**
 * Schema for guest user creation
 */
export const guestUserSchema = z.object({
    name: nameSchema
});

/**
 * Schema for authenticated user login
 */
export const loginSchema = z.object({
    email: emailSchema,
    token: z.string().min(1, 'Authentication token required')
});

/**
 * Schema for user profile updates
 */
export const updateProfileSchema = z.object({
    name: nameSchema.optional(),
    avatarUrl: z.string().url().optional()
}).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update'
});

// ═══════════════════════════════════════════════════════════════════════════
// LOBBY MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Schema for lobby settings
 */
export const lobbySettingsSchema = z.object({
    category: z.enum(QUESTION_CATEGORIES, {
        errorMap: () => ({ message: 'Invalid question category' })
    }),
    difficulty: z.enum(DIFFICULTY_LEVELS, {
        errorMap: () => ({ message: 'Invalid difficulty level' })
    }),
    questionCount: z.number()
        .int('Question count must be an integer')
        .min(1, 'At least 1 question required')
        .max(MAX_QUESTION_COUNT, `Maximum ${MAX_QUESTION_COUNT} questions allowed`)
        .default(DEFAULT_QUESTION_COUNT),
    timePerQuestion: z.number()
        .int('Time per question must be an integer')
        .min(MIN_TIME_PER_QUESTION, `Minimum ${MIN_TIME_PER_QUESTION} seconds per question`)
        .max(MAX_TIME_PER_QUESTION, `Maximum ${MAX_TIME_PER_QUESTION} seconds per question`),
    showCorrectAnswers: z.boolean().default(true),
    allowSpectators: z.boolean().default(true),
    pointsPerCorrect: z.number()
        .int('Points must be an integer')
        .min(1, 'Must award at least 1 point')
        .max(1000, 'Maximum 1000 points per correct answer'),
    speedBonus: z.number()
        .int('Speed bonus must be an integer')
        .min(0, 'Speed bonus cannot be negative')
        .max(200, 'Maximum 200 speed bonus points'),
    enablePowerups: z.boolean().default(false)
});

/**
 * Schema for lobby creation
 */
export const createLobbySchema = z.object({
    name: nameSchema,
    hostId: userIdSchema,
    settings: lobbySettingsSchema.optional(),
    maxPlayers: z.number()
        .int('Max players must be an integer')
        .min(MIN_PLAYERS_TO_START, `Minimum ${MIN_PLAYERS_TO_START} players required`)
        .max(MAX_PLAYERS_PER_LOBBY, `Maximum ${MAX_PLAYERS_PER_LOBBY} players allowed`)
        .default(MAX_PLAYERS_PER_LOBBY),
    isPrivate: z.boolean().default(false),
    password: passwordSchema
});

/**
 * Schema for joining a lobby
 */
export const joinLobbySchema = z.object({
    lobbyId: lobbyIdSchema,
    playerId: userIdSchema,
    password: passwordSchema
});

/**
 * Schema for updating lobby settings (only host can do this)
 */
export const updateLobbySettingsSchema = z.object({
    lobbyId: lobbyIdSchema,
    hostId: userIdSchema,
    settings: lobbySettingsSchema.partial()
});

/**
 * Schema for player ready state change
 */
export const playerReadySchema = z.object({
    lobbyId: lobbyIdSchema,
    playerId: userIdSchema,
    isReady: z.boolean()
});

// ═══════════════════════════════════════════════════════════════════════════
// GAME LOGIC
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Schema for questions
 */
export const questionSchema = z.object({
    id: z.string().min(1, 'Question ID required'),
    text: z.string().min(1, 'Question text required').max(500, 'Question text too long'),
    options: z.array(z.string().min(1, 'Option text required').max(200, 'Option text too long'))
        .min(2, 'At least 2 options required')
        .max(6, 'Maximum 6 options allowed'),
    correctIndex: z.number()
        .int('Correct index must be an integer')
        .min(0, 'Correct index cannot be negative'),
    category: z.enum(QUESTION_CATEGORIES),
    difficulty: z.enum(DIFFICULTY_LEVELS),
    timeLimit: z.number()
        .int('Time limit must be an integer')
        .min(MIN_TIME_PER_QUESTION)
        .max(MAX_TIME_PER_QUESTION),
    imageUrl: z.string().url().optional(),
    explanation: z.string().max(1000, 'Explanation too long').optional(),
    points: z.number().int().min(1).max(1000).optional()
}).refine(data => data.correctIndex < data.options.length, {
    message: 'Correct index must be within options range',
    path: ['correctIndex']
});

/**
 * Schema for answer submission
 */
export const submitAnswerSchema = z.object({
    gameId: gameIdSchema,
    questionId: z.string().min(1, 'Question ID required'),
    playerId: userIdSchema,
    selectedIndex: z.number()
        .int('Selected index must be an integer')
        .min(0, 'Selected index cannot be negative')
        .max(5, 'Selected index too high'),
    responseTime: z.number()
        .min(0, 'Response time cannot be negative')
        .max(300000, 'Response time too high (max 5 minutes)')
});

/**
 * Schema for powerup usage
 */
export const usePowerupSchema = z.object({
    gameId: gameIdSchema,
    playerId: userIdSchema,
    powerupType: z.enum(Object.values(POWERUP_TYPES), {
        errorMap: () => ({ message: 'Invalid powerup type' })
    }),
    questionId: z.string().min(1, 'Question ID required').optional()
});

/**
 * Schema for game creation
 */
export const createGameSchema = z.object({
    lobbyId: lobbyIdSchema,
    hostId: userIdSchema,
    questions: z.array(questionSchema).min(1, 'At least 1 question required'),
    settings: lobbySettingsSchema
});

// ═══════════════════════════════════════════════════════════════════════════
// SOCKET.IO EVENTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Schema for socket connection
 */
export const socketConnectionSchema = z.object({
    userId: userIdSchema.optional(),
    token: z.string().optional(),
    sessionId: z.string().optional()
});

/**
 * Schema for chat messages
 */
export const chatMessageSchema = z.object({
    lobbyId: lobbyIdSchema,
    playerId: userIdSchema,
    message: z.string()
        .min(1, 'Message cannot be empty')
        .max(500, 'Message too long')
        .transform(msg => msg.trim())
});

/**
 * Schema for kicking a player
 */
export const kickPlayerSchema = z.object({
    lobbyId: lobbyIdSchema,
    hostId: userIdSchema,
    targetPlayerId: userIdSchema
}).refine(data => data.hostId !== data.targetPlayerId, {
    message: 'Host cannot kick themselves',
    path: ['targetPlayerId']
});

/**
 * Schema for transferring host
 */
export const transferHostSchema = z.object({
    lobbyId: lobbyIdSchema,
    currentHostId: userIdSchema,
    newHostId: userIdSchema
}).refine(data => data.currentHostId !== data.newHostId, {
    message: 'Cannot transfer host to the same player',
    path: ['newHostId']
});

// ═══════════════════════════════════════════════════════════════════════════
// API RESPONSES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Schema for API error responses
 */
export const apiErrorSchema = z.object({
    code: z.string(),
    message: z.string(),
    field: z.string().optional(),
    details: z.record(z.any()).optional()
});

/**
 * Schema for API responses
 */
export const apiResponseSchema = z.object({
    success: z.boolean(),
    data: z.any().optional(),
    error: apiErrorSchema.optional(),
    meta: z.record(z.any()).optional()
});

// ═══════════════════════════════════════════════════════════════════════════
// SEARCH & FILTERING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Schema for lobby search/filtering
 */
export const lobbySearchSchema = z.object({
    category: z.enum(QUESTION_CATEGORIES).optional(),
    difficulty: z.enum(DIFFICULTY_LEVELS).optional(),
    hasPassword: z.boolean().optional(),
    hasSlots: z.boolean().optional(),
    sortBy: z.enum(['created', 'name', 'players']).default('created'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    limit: z.number().int().min(1).max(50).default(20),
    offset: z.number().int().min(0).default(0)
});

/**
 * Schema for leaderboard queries
 */
export const leaderboardQuerySchema = z.object({
    timeframe: z.enum(['daily', 'weekly', 'monthly', 'all-time']).default('all-time'),
    category: z.enum(QUESTION_CATEGORIES).optional(),
    limit: z.number().int().min(1).max(100).default(10)
});

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Creates a validation error with consistent format
 * @param {string} field - Field that failed validation
 * @param {string} message - Error message
 * @returns {Object} Formatted validation error
 */
export function createValidationError(field, message) {
    return {
        code: ERROR_CODES.VALIDATION_ERROR,
        message,
        field
    };
}

/**
 * Validates data against a schema and returns formatted result
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @param {any} data - Data to validate
 * @returns {Object} Validation result with success flag and data/errors
 */
export function validateData(schema, data) {
    try {
        const validatedData = schema.parse(data);
        return {
            success: true,
            data: validatedData,
            errors: null
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            const formattedErrors = error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message,
                code: ERROR_CODES.VALIDATION_ERROR
            }));

            return {
                success: false,
                data: null,
                errors: formattedErrors
            };
        }

        // Re-throw non-validation errors
        throw error;
    }
}

/**
 * Middleware-friendly validation function
 * @param {z.ZodSchema} schema - Schema to validate against
 * @returns {Function} Express middleware function
 */
export function validateMiddleware(schema) {
    return (req, res, next) => {
        const result = validateData(schema, req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: {
                    code: ERROR_CODES.VALIDATION_ERROR,
                    message: 'Validation failed',
                    details: result.errors
                }
            });
        }

        // Replace req.body with validated data
        req.body = result.data;
        next();
    };
}

/**
 * Validates query parameters
 * @param {z.ZodSchema} schema - Schema to validate against
 * @returns {Function} Express middleware function
 */
export function validateQueryMiddleware(schema) {
    return (req, res, next) => {
        const result = validateData(schema, req.query);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: {
                    code: ERROR_CODES.VALIDATION_ERROR,
                    message: 'Query validation failed',
                    details: result.errors
                }
            });
        }

        req.query = result.data;
        next();
    };
}

/**
 * Validates socket event data
 * @param {z.ZodSchema} schema - Schema to validate against
 * @param {any} data - Data to validate
 * @param {Function} callback - Socket callback function
 * @returns {Object|null} Validated data or null if validation failed
 */
export function validateSocketData(schema, data, callback) {
    const result = validateData(schema, data);

    if (!result.success) {
        if (callback) {
            callback({
                success: false,
                error: {
                    code: ERROR_CODES.VALIDATION_ERROR,
                    message: 'Invalid data provided',
                    details: result.errors
                }
            });
        }
        return null;
    }

    return result.data;
}

// Export all schemas as default object for convenience
export default {
    userIdSchema,
    nameSchema,
    emailSchema,
    passwordSchema,
    lobbyIdSchema,
    gameIdSchema,
    userSchema,
    guestUserSchema,
    loginSchema,
    updateProfileSchema,
    lobbySettingsSchema,
    createLobbySchema,
    joinLobbySchema,
    updateLobbySettingsSchema,
    playerReadySchema,
    questionSchema,
    submitAnswerSchema,
    usePowerupSchema,
    createGameSchema,
    socketConnectionSchema,
    chatMessageSchema,
    kickPlayerSchema,
    transferHostSchema,
    apiErrorSchema,
    apiResponseSchema,
    lobbySearchSchema,
    leaderboardQuerySchema,
    createValidationError,
    validateData,
    validateMiddleware,
    validateQueryMiddleware,
    validateSocketData
};