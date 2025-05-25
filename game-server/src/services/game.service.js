// ═══════════════════════════════════════════════════════════════════════════
// src/services/gameService.js
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Temporary basic game service implementation
 */
class GameService {
    constructor() {
        this.games = new Map();
    }

    getStatistics() {
        return {
            totalGames: this.games.size,
            activeGames: 0,
            completedGames: 0,
            totalPlayers: 0,
            averageGameDuration: 0
        };
    }
}

export default new GameService();