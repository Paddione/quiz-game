/**
 * @fileoverview Unit tests for shared utility functions.
 * Ensures that common utility functions behave as expected.
 *
 * @author Quiz Game Team
 * @version 1.0.0
 */

import { generateLobbyId, generateUUID, capitalize } from '../utils.js'; // Assuming utils.js is in the parent directory of 'tests'

describe('Shared Utility Functions', () => {
    describe('generateLobbyId', () => {
        test('should return a string of length 6', () => {
            const lobbyId = generateLobbyId();
            expect(typeof lobbyId).toBe('string');
            expect(lobbyId.length).toBe(6);
        });

        test('should return an alphanumeric string', () => {
            const lobbyId = generateLobbyId();
            expect(lobbyId).toMatch(/^[A-Z0-9]{6}$/);
        });

        test('should generate different IDs on subsequent calls', () => {
            const id1 = generateLobbyId();
            const id2 = generateLobbyId();
            expect(id1).not.toBe(id2);
        });
    });

    describe('generateUUID', () => {
        test('should return a valid UUID v4 string', () => {
            const uuid = generateUUID();
            // Basic UUID v4 regex
            const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            expect(uuid).toMatch(uuidV4Regex);
        });

        test('should generate different UUIDs on subsequent calls', () => {
            const uuid1 = generateUUID();
            const uuid2 = generateUUID();
            expect(uuid1).not.toBe(uuid2);
        });
    });

    describe('capitalize', () => {
        test('should capitalize the first letter of a string', () => {
            expect(capitalize('hello')).toBe('Hello');
        });

        test('should return an empty string if input is empty', () => {
            expect(capitalize('')).toBe('');
        });

        test('should handle already capitalized strings', () => {
            expect(capitalize('World')).toBe('World');
        });

        test('should handle strings with numbers and symbols', () => {
            expect(capitalize('1test')).toBe('1test'); // Behavior might depend on exact requirements
            expect(capitalize(' test')).toBe(' test');
        });
    });

    // Add more tests for other utility functions from utils.js
    // For example:
    // describe('shuffleArray', () => { ... });
    // describe('isValidEmail', () => { ... });
});
