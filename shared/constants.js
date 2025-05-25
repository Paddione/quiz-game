/**
 * @fileoverview Game constants and configuration values.
 * Central location for all game-related constants to ensure consistency.
 *
 * @author Quiz Game Team
 * @version 1.0.0
 */

// ═══════════════════════════════════════════════════════════════════════════
// GAME CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Maximum number of players allowed in a single lobby
 * @type {number}
 */
export const MAX_PLAYERS_PER_LOBBY = 8;

/**
 * Minimum number of players required to start a game
 * @type {number}
 */
export const MIN_PLAYERS_TO_START = 2;

/**
 * Default number of questions per game
 * @type {number}
 */
export const DEFAULT_QUESTION_COUNT = 10;

/**
 * Maximum number of questions allowed per game
 * @type {number}
 */
export const MAX_QUESTION_COUNT = 50;

/**
 * Default time limit per question in seconds
 * @type {number}
 */
export const DEFAULT_TIME_PER_QUESTION = 30;

/**
 * Maximum time limit per question in seconds
 * @type {number}
 */
export const MAX_TIME_PER_QUESTION = 120;

/**
 * Minimum time limit per question in seconds
 * @type {number}
 */
export const MIN_TIME_PER_QUESTION = 5;

// ═══════════════════════════════════════════════════════════════════════════
// SCORING SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Base points awarded for a correct answer
 * @type {number}
 */
export const BASE_POINTS_CORRECT = 100;

/**
 * Points deducted for an incorrect answer
 * @type {number}
 */
export const POINTS_INCORRECT = 0;

/**
 * Maximum speed bonus points for very fast answers
 * @type {number}
 */
export const MAX_SPEED_BONUS = 50;

/**
 * Time threshold for speed bonus (answers faster than this get bonus)
 * @type {number}
 */
export const SPEED_BONUS_THRESHOLD = 5; // seconds

/**
 * Multiplier for consecutive correct answers (streak bonus)
 * @type {number}
 */
export const STREAK_MULTIPLIER = 1.1;

/**
 * Maximum streak multiplier cap
 * @type {number}
 */
export const MAX_STREAK_MULTIPLIER = 2.0;

// ═══════════════════════════════════════════════════════════════════════════
// QUESTION CATEGORIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Available question categories
 * @type {string[]}
 */
export const QUESTION_CATEGORIES = [
    'general-knowledge',
    'science',
    'history',
    'geography',
    'sports',
    'entertainment',
    'arts-literature',
    'technology',
    'nature',
    'mythology'
];

/**
 * Localized category names (German)
 * @type {Object.<string, string>}
 */
export const CATEGORY_LABELS = {
    'general-knowledge': 'Allgemeinwissen',
    'science': 'Wissenschaft',
    'history': 'Geschichte',
    'geography': 'Geografie',
    'sports': 'Sport',
    'entertainment': 'Unterhaltung',
    'arts-literature': 'Kunst & Literatur',
    'technology': 'Technologie',
    'nature': 'Natur',
    'mythology': 'Mythologie'
};

/**
 * Available difficulty levels
 * @type {string[]}
 */
export const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'];

/**
 * Localized difficulty labels (German)
 * @type {Object.<string, string>}
 */
export const DIFFICULTY_LABELS = {
    'easy': 'Einfach',
    'medium': 'Mittel',
    'hard': 'Schwer'
};

// ═══════════════════════════════════════════════════════════════════════════
// LOBBY & GAME STATES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Possible lobby statuses
 * @type {Object.<string, string>}
 */
export const LOBBY_STATUS = {
    WAITING: 'waiting',
    STARTING: 'starting',
    ACTIVE: 'active',
    FINISHED: 'finished',
    ABANDONED: 'abandoned'
};

/**
 * Possible game statuses
 * @type {Object.<string, string>}
 */
export const GAME_STATUS = {
    PREPARING: 'preparing',
    QUESTION: 'question',
    ANSWERING: 'answering',
    REVEALING: 'revealing',
    FINISHED: 'finished',
    PAUSED: 'paused'
};

// ═══════════════════════════════════════════════════════════════════════════
// TIMEOUTS & INTERVALS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Time to wait before starting game after all players ready (seconds)
 * @type {number}
 */
export const GAME_START_COUNTDOWN = 5;

/**
 * Time to show correct answer after question ends (seconds)
 * @type {number}
 */
export const ANSWER_REVEAL_TIME = 5;

/**
 * Time to show final results before returning to lobby (seconds)
 * @type {number}
 */
export const RESULTS_DISPLAY_TIME = 15;

/**
 * Maximum time a lobby can be inactive before cleanup (minutes)
 * @type {number}
 */
export const LOBBY_INACTIVE_TIMEOUT = 30;

/**
 * Maximum time a player can be disconnected before removal (minutes)
 * @type {number}
 */
export const PLAYER_DISCONNECT_TIMEOUT = 5;

/**
 * Interval for cleanup tasks (minutes)
 * @type {number}
 */
export const CLEANUP_INTERVAL = 5;

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION LIMITS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Minimum length for player/lobby names
 * @type {number}
 */
export const MIN_NAME_LENGTH = 2;

/**
 * Maximum length for player/lobby names
 * @type {number}
 */
export const MAX_NAME_LENGTH = 20;

/**
 * Maximum length for lobby password
 * @type {number}
 */
export const MAX_PASSWORD_LENGTH = 50;

/**
 * Maximum number of questions that can be loaded at once
 * @type {number}
 */
export const MAX_QUESTIONS_BATCH = 100;

/**
 * Maximum file size for uploaded images (bytes)
 * @type {number}
 */
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// ═══════════════════════════════════════════════════════════════════════════
// SOCKET.IO EVENTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Client-to-server socket events
 * @type {Object.<string, string>}
 */
export const SOCKET_EVENTS_CLIENT = {
    // Connection events
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    JOIN_LOBBY: 'join-lobby',
    LEAVE_LOBBY: 'leave-lobby',

    // Lobby events
    CREATE_LOBBY: 'create-lobby',
    UPDATE_LOBBY_SETTINGS: 'update-lobby-settings',
    READY_STATE_CHANGE: 'ready-state-change',
    KICK_PLAYER: 'kick-player',
    TRANSFER_HOST: 'transfer-host',

    // Game events
    START_GAME: 'start-game',
    SUBMIT_ANSWER: 'submit-answer',
    USE_POWERUP: 'use-powerup',
    PAUSE_GAME: 'pause-game',
    RESUME_GAME: 'resume-game',

    // Chat events
    SEND_MESSAGE: 'send-message',

    // Admin events
    FORCE_END_GAME: 'force-end-game'
};

/**
 * Server-to-client socket events
 * @type {Object.<string, string>}
 */
export const SOCKET_EVENTS_SERVER = {
    // Connection events
    CONNECTION_ESTABLISHED: 'connection-established',
    PLAYER_CONNECTED: 'player-connected',
    PLAYER_DISCONNECTED: 'player-disconnected',

    // Lobby events
    LOBBY_CREATED: 'lobby-created',
    LOBBY_UPDATED: 'lobby-updated',
    LOBBY_JOINED: 'lobby-joined',
    LOBBY_LEFT: 'lobby-left',
    PLAYER_JOINED: 'player-joined',
    PLAYER_LEFT: 'player-left',
    PLAYER_READY_CHANGED: 'player-ready-changed',
    HOST_TRANSFERRED: 'host-transferred',

    // Game events
    GAME_STARTING: 'game-starting',
    GAME_STARTED: 'game-started',
    QUESTION_STARTED: 'question-started',
    PLAYER_ANSWERED: 'player-answered',
    QUESTION_ENDED: 'question-ended',
    ANSWER_REVEALED: 'answer-revealed',
    GAME_ENDED: 'game-ended',
    SCORES_UPDATED: 'scores-updated',

    // Timer events
    TIMER_TICK: 'timer-tick',
    TIMER_WARNING: 'timer-warning',

    // Error events
    ERROR: 'error',
    VALIDATION_ERROR: 'validation-error',

    // Chat events
    MESSAGE_RECEIVED: 'message-received',

    // System events
    SYSTEM_MESSAGE: 'system-message'
};

// ═══════════════════════════════════════════════════════════════════════════
// ERROR CODES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Application error codes
 * @type {Object.<string, string>}
 */
export const ERROR_CODES = {
    // Validation errors
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    INVALID_INPUT: 'INVALID_INPUT',
    MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',

    // Authentication errors
    AUTH_ERROR: 'AUTH_ERROR',
    INVALID_TOKEN: 'INVALID_TOKEN',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    UNAUTHORIZED: 'UNAUTHORIZED',

    // Lobby errors
    LOBBY_ERROR: 'LOBBY_ERROR',
    LOBBY_NOT_FOUND: 'LOBBY_NOT_FOUND',
    LOBBY_FULL: 'LOBBY_FULL',
    LOBBY_CLOSED: 'LOBBY_CLOSED',
    INVALID_PASSWORD: 'INVALID_PASSWORD',
    ALREADY_IN_LOBBY: 'ALREADY_IN_LOBBY',
    NOT_IN_LOBBY: 'NOT_IN_LOBBY',
    NOT_HOST: 'NOT_HOST',

    // Game errors
    GAME_ERROR: 'GAME_ERROR',
    GAME_NOT_FOUND: 'GAME_NOT_FOUND',
    GAME_ALREADY_STARTED: 'GAME_ALREADY_STARTED',
    GAME_NOT_STARTED: 'GAME_NOT_STARTED',
    INVALID_ANSWER: 'INVALID_ANSWER',
    ALREADY_ANSWERED: 'ALREADY_ANSWERED',
    TIME_EXPIRED: 'TIME_EXPIRED',

    // Server errors
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

    // Question errors
    QUESTION_ERROR: 'QUESTION_ERROR',
    QUESTIONS_NOT_FOUND: 'QUESTIONS_NOT_FOUND',
    INVALID_CATEGORY: 'INVALID_CATEGORY',
    INVALID_DIFFICULTY: 'INVALID_DIFFICULTY'
};

// ═══════════════════════════════════════════════════════════════════════════
// HTTP STATUS CODES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * HTTP status codes used throughout the application
 * @type {Object.<string, number>}
 */
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
};

// ═══════════════════════════════════════════════════════════════════════════
// POWERUPS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Available powerup types
 * @type {Object.<string, string>}
 */
export const POWERUP_TYPES = {
    FREEZE: 'freeze',           // Freeze timer for 10 seconds
    DOUBLE_POINTS: 'double-points', // Double points for next answer
    SKIP: 'skip',               // Skip current question
    FIFTY_FIFTY: 'fifty-fifty', // Remove two wrong answers
    EXTRA_TIME: 'extra-time'    // Add 15 seconds to timer
};

/**
 * Powerup cost in points
 * @type {Object.<string, number>}
 */
export const POWERUP_COSTS = {
    [POWERUP_TYPES.FREEZE]: 150,
    [POWERUP_TYPES.DOUBLE_POINTS]: 200,
    [POWERUP_TYPES.SKIP]: 100,
    [POWERUP_TYPES.FIFTY_FIFTY]: 125,
    [POWERUP_TYPES.EXTRA_TIME]: 75
};

// ═══════════════════════════════════════════════════════════════════════════
// RATE LIMITING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Rate limiting configurations
 * @type {Object}
 */
export const RATE_LIMITS = {
    // API rate limits (requests per minute)
    API_DEFAULT: 100,
    API_AUTH: 10,
    API_CREATE_LOBBY: 5,

    // Socket event rate limits (events per minute)
    SOCKET_DEFAULT: 60,
    SOCKET_CHAT: 30,
    SOCKET_ANSWER: 120, // Higher limit for answers

    // Game action limits
    LOBBY_CREATION_PER_HOUR: 5,
    ANSWER_SUBMISSION_PER_QUESTION: 1
};

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Default lobby settings
 * @type {Object}
 */
export const DEFAULT_LOBBY_SETTINGS = {
    category: 'general-knowledge',
    difficulty: 'medium',
    questionCount: DEFAULT_QUESTION_COUNT,
    timePerQuestion: DEFAULT_TIME_PER_QUESTION,
    showCorrectAnswers: true,
    allowSpectators: true,
    pointsPerCorrect: BASE_POINTS_CORRECT,
    speedBonus: MAX_SPEED_BONUS,
    enablePowerups: false
};

/**
 * Environment-specific configurations
 * @type {Object}
 */
export const ENV_CONFIG = {
    development: {
        logLevel: 'debug',
        enableDebugMode: true,
        socketTimeout: 10000
    },
    production: {
        logLevel: 'info',
        enableDebugMode: false,
        socketTimeout: 5000
    }
};

// Export all constants as default object for convenience
export default {
    MAX_PLAYERS_PER_LOBBY,
    MIN_PLAYERS_TO_START,
    DEFAULT_QUESTION_COUNT,
    MAX_QUESTION_COUNT,
    DEFAULT_TIME_PER_QUESTION,
    MAX_TIME_PER_QUESTION,
    MIN_TIME_PER_QUESTION,
    BASE_POINTS_CORRECT,
    POINTS_INCORRECT,
    MAX_SPEED_BONUS,
    SPEED_BONUS_THRESHOLD,
    STREAK_MULTIPLIER,
    MAX_STREAK_MULTIPLIER,
    QUESTION_CATEGORIES,
    CATEGORY_LABELS,
    DIFFICULTY_LEVELS,
    DIFFICULTY_LABELS,
    LOBBY_STATUS,
    GAME_STATUS,
    GAME_START_COUNTDOWN,
    ANSWER_REVEAL_TIME,
    RESULTS_DISPLAY_TIME,
    LOBBY_INACTIVE_TIMEOUT,
    PLAYER_DISCONNECT_TIMEOUT,
    CLEANUP_INTERVAL,
    MIN_NAME_LENGTH,
    MAX_NAME_LENGTH,
    MAX_PASSWORD_LENGTH,
    MAX_QUESTIONS_BATCH,
    MAX_IMAGE_SIZE,
    SOCKET_EVENTS_CLIENT,
    SOCKET_EVENTS_SERVER,
    ERROR_CODES,
    HTTP_STATUS,
    POWERUP_TYPES,
    POWERUP_COSTS,
    RATE_LIMITS,
    DEFAULT_LOBBY_SETTINGS,
    ENV_CONFIG
};