/**
 * Checks if a lobby has available slots for new players
 * @param {Object} lobby - Lobby object
 * @returns {boolean} True if lobby has available slots
 */
export function hasAvailableSlots(lobby) {
    return lobby.players.length < lobby.maxPlayers;
}

/**
 * Checks if a game can be started (enough players, all ready)
 * @param {Object} lobby - Lobby object
 * @returns {boolean} True if game can be started
 */
export function canStartGame(lobby) {
    const readyPlayers = lobby.players.filter(p => p.isReady);
    return readyPlayers.length >= 2 && readyPlayers.length === lobby.players.length;
}

/**
 * Calculates powerup cost based on type
 * @param {string} powerupType - Type of powerup
 * @returns {number} Cost in points
 */
export function getPowerupCost(powerupType) {
    return POWERUP_COSTS[powerupType] || 0;
}

/**
 * Checks if a player can afford a powerup
 * @param {Object} player - Player object with score
 * @param {string} powerupType - Type of powerup
 * @returns {boolean} True if player can afford the powerup
 */
export function canAffordPowerup(player, powerupType) {
    const cost = getPowerupCost(powerupType);
    return player.score >= cost;
}

/**
 * Processes fifty-fifty powerup (removes 2 wrong answers)
 * @param {Object} question - Question object
 * @returns {Array} Indices of options to keep
 */
export function applyFiftyFifty(question) {
    const correctIndex = question.correctIndex;
    const wrongIndices = question.options
        .map((_, index) => index)
        .filter(index => index !== correctIndex);

    // Keep correct answer and one random wrong answer
    const keepWrong = getRandomElement(wrongIndices);
    return [correctIndex, keepWrong].sort((a, b) => a - b);
}

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Checks if a value is a valid lobby ID format
 * @param {string} id - ID to validate
 * @returns {boolean} True if valid lobby ID
 */
export function isValidLobbyId(id) {
    return typeof id === 'string' && /^[A-Z0-9]{6}$/.test(id);
}

/**
 * Checks if a value is a valid UUID
 * @param {string} id - ID to validate
 * @returns {boolean} True if valid UUID
 */
export function isValidUUID(id) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return typeof id === 'string' && uuidRegex.test(id);
}

/**
 * Checks if an email address is valid
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return typeof email === 'string' && emailRegex.test(email);
}

/**
 * Checks if a name contains only allowed characters
 * @param {string} name - Name to validate
 * @returns {boolean} True if name is valid
 */
export function isValidName(name) {
    const nameRegex = /^[a-zA-Z0-9\s\-_äöüßÄÖÜ]+$/;
    return typeof name === 'string' && nameRegex.test(name.trim());
}

// ═══════════════════════════════════════════════════════════════════════════
// ERROR HANDLING UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Creates a standardized error response
 * @param {string} code - Error code
 * @param {string} message - Error message
 * @param {Object} details - Additional error details
 * @returns {Object} Standardized error object
 */
export function createError(code, message, details = null) {
    return {
        code,
        message,
        details,
        timestamp: new Date().toISOString()
    };
}

/**
 * Wraps an async function with error handling
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function that catches errors
 */
export function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

/**
 * Safely executes a function and returns result or error
 * @param {Function} fn - Function to execute
 * @param {...any} args - Arguments to pass to function
 * @returns {Object} Object with success flag and result/error
 */
export function safeExecute(fn, ...args) {
    try {
        const result = fn(...args);
        return { success: true, result, error: null };
    } catch (error) {
        return { success: false, result: null, error };
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// RATE LIMITING UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Simple in-memory rate limiter
 * @param {number} maxRequests - Maximum requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Function} Rate limiter function
 */
export function createRateLimiter(maxRequests, windowMs) {
    const requests = new Map();

    return (identifier) => {
        const now = Date.now();
        const windowStart = now - windowMs;

        // Clean old entries
        if (requests.has(identifier)) {
            const userRequests = requests.get(identifier);
            const validRequests = userRequests.filter(time => time > windowStart);
            requests.set(identifier, validRequests);
        }

        // Check if limit exceeded
        const userRequests = requests.get(identifier) || [];
        if (userRequests.length >= maxRequests) {
            return false;
        }

        // Add new request
        userRequests.push(now);
        requests.set(identifier, userRequests);

        return true;
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// LOGGING UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Creates a structured log entry
 * @param {string} level - Log level (info, warn, error, debug)
 * @param {string} message - Log message
 * @param {Object} metadata - Additional metadata
 * @returns {Object} Structured log entry
 */
export function createLogEntry(level, message, metadata = {}) {
    return {
        timestamp: new Date().toISOString(),
        level: level.toUpperCase(),
        message,
        ...metadata
    };
}

/**
 * Safe JSON stringify with circular reference handling
 * @param {any} obj - Object to stringify
 * @param {number} space - Number of spaces for indentation
 * @returns {string} JSON string
 */
export function safeStringify(obj, space = 0) {
    const seen = new WeakSet();
    return JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
                return '[Circular]';
            }
            seen.add(value);
        }
        return value;
    }, space);
}

// ═══════════════════════════════════════════════════════════════════════════
// RETRY UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Retries an async operation with exponential backoff
 * @param {Function} operation - Async operation to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise} Promise that resolves with operation result
 */
export async function retryWithBackoff(operation, maxRetries = 3, baseDelay = 1000) {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;

            if (attempt === maxRetries) {
                break;
            }

            const delay = baseDelay * Math.pow(2, attempt);
            await sleep(delay);
        }
    }

    throw lastError;
}

/**
 * Creates a promise that resolves after specified delay
 * @param {number} ms - Delay in milliseconds
 * @returns {Promise} Promise that resolves after delay
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ═══════════════════════════════════════════════════════════════════════════
// DEBOUNCE & THROTTLE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Creates a debounced version of a function
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(fn, delay) {
    let timeoutId;

    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
}

/**
 * Creates a throttled version of a function
 * @param {Function} fn - Function to throttle
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(fn, delay) {
    let lastCall = 0;

    return function(...args) {
        const now = Date.now();
        if (now - lastCall >= delay) {
            lastCall = now;
            return fn.apply(this, args);
        }
    };
}

// Export all utilities as default object for convenience
export default {
    generateLobbyId,
    generateUUID,
    generateSessionId,
    now,
    secondsToMs,
    msToSeconds,
    formatDuration,
    createTimer,
    shuffleArray,
    getRandomElement,
    getRandomElements,
    chunkArray,
    deepClone,
    getNestedProperty,
    omit,
    pick,
    capitalize,
    toKebabCase,
    toCamelCase,
    truncate,
    sanitizeString,
    clamp,
    randomInt,
    roundTo,
    calculatePercentage,
    calculateScore,
    calculateStreakMultiplier,
    getPlayerRank,
    hasAvailableSlots,
    canStartGame,
    getPowerupCost,
    canAffordPowerup,
    applyFiftyFifty,
    isValidLobbyId,
    isValidUUID,
    isValidEmail,
    isValidName,
    createError,
    asyncHandler,
    safeExecute,
    createRateLimiter,
    createLogEntry,
    safeStringify,
    retryWithBackoff,
    sleep,
    debounce,
    throttle
};
* @fileoverview Common utility functions shared across the Quiz Game application.
* Provides reusable helper functions for various operations.
*
* @author Quiz Game Team
* @version 1.0.0
*/

import crypto from 'crypto';
import { MAX_PLAYERS_PER_LOBBY, POWERUP_COSTS } from './constants.js';

// ═══════════════════════════════════════════════════════════════════════════
// ID GENERATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generates a random lobby ID (6 characters, uppercase alphanumeric)
 * @returns {string} Random lobby ID
 */
export function generateLobbyId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Generates a UUID v4
 * @returns {string} UUID v4 string
 */
export function generateUUID() {
    return crypto.randomUUID();
}

/**
 * Generates a random session ID
 * @returns {string} Random session ID
 */
export function generateSessionId() {
    return crypto.randomBytes(32).toString('hex');
}

// ═══════════════════════════════════════════════════════════════════════════
// TIME UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Gets current timestamp in milliseconds
 * @returns {number} Current timestamp
 */
export function now() {
    return Date.now();
}

/**
 * Converts seconds to milliseconds
 * @param {number} seconds - Seconds to convert
 * @returns {number} Milliseconds
 */
export function secondsToMs(seconds) {
    return seconds * 1000;
}

/**
 * Converts milliseconds to seconds
 * @param {number} milliseconds - Milliseconds to convert
 * @returns {number} Seconds
 */
export function msToSeconds(milliseconds) {
    return Math.floor(milliseconds / 1000);
}

/**
 * Formats a duration in seconds to human-readable format
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration (e.g., "2m 30s", "45s")
 */
export function formatDuration(seconds) {
    if (seconds < 60) {
        return `${seconds}s`;
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (remainingSeconds === 0) {
        return `${minutes}m`;
    }

    return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Creates a timer object with remaining time calculation
 * @param {number} durationSeconds - Timer duration in seconds
 * @returns {Object} Timer object with utility methods
 */
export function createTimer(durationSeconds) {
    const startTime = now();
    const endTime = startTime + secondsToMs(durationSeconds);

    return {
        duration: durationSeconds,
        startedAt: new Date(startTime),
        endsAt: new Date(endTime),
        isActive: true,

        getRemaining() {
            const remaining = Math.max(0, msToSeconds(endTime - now()));
            return remaining;
        },

        isExpired() {
            return now() >= endTime;
        },

        getProgress() {
            const elapsed = now() - startTime;
            const total = endTime - startTime;
            return Math.min(1, elapsed / total);
        }
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// ARRAY UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Shuffles an array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} New shuffled array
 */
export function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Gets a random element from an array
 * @param {Array} array - Array to select from
 * @returns {*} Random element
 */
export function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Gets multiple random elements from an array without duplicates
 * @param {Array} array - Array to select from
 * @param {number} count - Number of elements to select
 * @returns {Array} Array of random elements
 */
export function getRandomElements(array, count) {
    const shuffled = shuffleArray(array);
    return shuffled.slice(0, Math.min(count, array.length));
}

/**
 * Chunks an array into smaller arrays of specified size
 * @param {Array} array - Array to chunk
 * @param {number} size - Size of each chunk
 * @returns {Array} Array of chunks
 */
export function chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

// ═══════════════════════════════════════════════════════════════════════════
// OBJECT UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Deep clones an object
 * @param {Object} obj - Object to clone
 * @returns {Object} Deep cloned object
 */
export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Safely gets a nested property from an object
 * @param {Object} obj - Object to get property from
 * @param {string} path - Dot-separated path to property
 * @param {*} defaultValue - Default value if property doesn't exist
 * @returns {*} Property value or default value
 */
export function getNestedProperty(obj, path, defaultValue = undefined) {
    return path.split('.').reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : defaultValue;
    }, obj);
}

/**
 * Omits specified keys from an object
 * @param {Object} obj - Source object
 * @param {string[]} keys - Keys to omit
 * @returns {Object} New object without specified keys
 */
export function omit(obj, keys) {
    const result = { ...obj };
    keys.forEach(key => delete result[key]);
    return result;
}

/**
 * Picks specified keys from an object
 * @param {Object} obj - Source object
 * @param {string[]} keys - Keys to pick
 * @returns {Object} New object with only specified keys
 */
export function pick(obj, keys) {
    const result = {};
    keys.forEach(key => {
        if (key in obj) {
            result[key] = obj[key];
        }
    });
    return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// STRING UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Capitalizes the first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Converts a string to kebab-case
 * @param {string} str - String to convert
 * @returns {string} Kebab-case string
 */
export function toKebabCase(str) {
    return str
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase();
}

/**
 * Converts a string to camelCase
 * @param {string} str - String to convert
 * @returns {string} CamelCase string
 */
export function toCamelCase(str) {
    return str
        .replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '');
}

/**
 * Truncates a string to a specified length with ellipsis
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated string
 */
export function truncate(str, maxLength) {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength - 3) + '...';
}

/**
 * Sanitizes a string for safe HTML display
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
export function sanitizeString(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

// ═══════════════════════════════════════════════════════════════════════════
// MATH UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Clamps a number between min and max values
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Generates a random integer between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random integer
 */
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Rounds a number to specified decimal places
 * @param {number} value - Value to round
 * @param {number} decimals - Number of decimal places
 * @returns {number} Rounded value
 */
export function roundTo(value, decimals) {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
}

/**
 * Calculates percentage between two numbers
 * @param {number} value - Current value
 * @param {number} total - Total value
 * @returns {number} Percentage (0-100)
 */
export function calculatePercentage(value, total) {
    if (total === 0) return 0;
    return roundTo((value / total) * 100, 2);
}

// ═══════════════════════════════════════════════════════════════════════════
// GAME-SPECIFIC UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculates score for a correct answer including speed bonus
 * @param {number} basePoints - Base points for correct answer
 * @param {number} responseTime - Response time in seconds
 * @param {number} timeLimit - Question time limit in seconds
 * @param {number} maxSpeedBonus - Maximum speed bonus points
 * @returns {number} Total points earned
 */
export function calculateScore(basePoints, responseTime, timeLimit, maxSpeedBonus) {
    // Speed bonus decreases linearly from max to 0 over the time limit
    const speedRatio = Math.max(0, (timeLimit - responseTime) / timeLimit);
    const speedBonus = Math.floor(speedRatio * maxSpeedBonus);

    return basePoints + speedBonus;
}

/**
 * Calculates streak multiplier for consecutive correct answers
 * @param {number} streak - Current streak count
 * @param {number} baseMultiplier - Base streak multiplier
 * @param {number} maxMultiplier - Maximum streak multiplier
 * @returns {number} Streak multiplier
 */
export function calculateStreakMultiplier(streak, baseMultiplier, maxMultiplier) {
    if (streak <= 1) return 1;

    const multiplier = 1 + (streak - 1) * (baseMultiplier - 1);
    return Math.min(multiplier, maxMultiplier);
}

/**
 * Determines player rank based on score
 * @param {Array} players - Array of player objects with scores
 * @param {string} playerId - ID of player to get rank for
 * @returns {number} Player rank (1-based)
 */
export function getPlayerRank(players, playerId) {
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    const playerIndex = sortedPlayers.findIndex(p => p.id === playerId);
    return playerIndex + 1;
}

/**