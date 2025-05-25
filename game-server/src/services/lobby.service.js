// ═══════════════════════════════════════════════════════════════════════════
// src/services/lobbyService.js
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Temporary basic lobby service implementation
 */
class LobbyService {
    constructor() {
        this.lobbies = new Map();
    }

    getStatistics() {
        return {
            totalLobbies: this.lobbies.size,
            activeLobbies: 0,
            waitingLobbies: this.lobbies.size,
            totalPlayers: 0,
            averagePlayersPerLobby: 0
        };
    }

    getPublicLobbies(filters = {}) {
        return [];
    }
}

export default new LobbyService();
