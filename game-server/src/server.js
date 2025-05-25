/**
 * @fileoverview Main server entry point for the Quiz Game application.
 * Sets up Express server, Socket.IO, middleware, and routes.
 *
 * @author Quiz Game Team
 * @version 1.0.0
 */

import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import shared utilities and services
import { errorHandler } from './shared/errors.js';
import {
    SOCKET_EVENTS_CLIENT,
    SOCKET_EVENTS_SERVER,
    ENV_CONFIG
} from './shared/constants.js';

// Import services
import lobbyService from './src/services/lobbyService.js';
import gameService from './src/services/gameService.js';

// ES modules setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);

// Socket.IO setup with CORS
const io = new SocketIOServer(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
    },
    transports: ['websocket', 'polling']
});

// Environment configuration
const NODE_ENV = process.env.NODE_ENV || 'development';
const config = ENV_CONFIG[NODE_ENV] || ENV_CONFIG.development;

// ═══════════════════════════════════════════════════════════════════════════
// MIDDLEWARE SETUP
// ═══════════════════════════════════════════════════════════════════════════

// Security middleware
app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// CORS setup
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging middleware
if (NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request timing middleware
app.use((req, res, next) => {
    req.startTime = Date.now();
    next();
});

// ═══════════════════════════════════════════════════════════════════════════
// API ROUTES
// ═══════════════════════════════════════════════════════════════════════════

// Health check endpoint
app.get('/health', (req, res) => {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();

    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
        memory: {
            used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
            total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`
        },
        environment: NODE_ENV,
        nodeVersion: process.version
    });
});

// API info endpoint
app.get('/api', (req, res) => {
    res.json({
        name: 'Quiz Game API',
        version: '1.0.0',
        description: 'Backend API for the Quiz Game application',
        endpoints: {
            health: '/health',
            websocket: '/socket.io/',
            api: '/api'
        },
        socketEvents: {
            client: Object.keys(SOCKET_EVENTS_CLIENT),
            server: Object.keys(SOCKET_EVENTS_SERVER)
        }
    });
});

// Lobby statistics endpoint
app.get('/api/stats', (req, res) => {
    try {
        const lobbyStats = lobbyService.getStatistics();
        const gameStats = gameService.getStatistics();

        res.json({
            success: true,
            data: {
                lobbies: lobbyStats,
                games: gameStats,
                server: {
                    uptime: process.uptime(),
                    memoryUsage: process.memoryUsage(),
                    environment: NODE_ENV
                }
            }
        });
    } catch (error) {
        console.error('Error getting statistics:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to get statistics'
            }
        });
    }
});

// Public lobbies endpoint
app.get('/api/lobbies', (req, res) => {
    try {
        const filters = {
            category: req.query.category,
            difficulty: req.query.difficulty,
            hasSlots: req.query.hasSlots === 'true',
            sortBy: req.query.sortBy || 'created',
            sortOrder: req.query.sortOrder || 'desc',
            limit: parseInt(req.query.limit) || 20,
            offset: parseInt(req.query.offset) || 0
        };

        const lobbies = lobbyService.getPublicLobbies(filters);

        res.json({
            success: true,
            data: lobbies,
            meta: {
                count: lobbies.length,
                filters: filters
            }
        });
    } catch (error) {
        console.error('Error getting lobbies:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to get lobbies'
            }
        });
    }
});

// ═══════════════════════════════════════════════════════════════════════════
// SOCKET.IO CONNECTION HANDLING
// ═══════════════════════════════════════════════════════════════════════════

// Store active connections
const activeConnections = new Map(); // socketId -> playerInfo
const playerSockets = new Map(); // playerId -> socketId

io.on('connection', (socket) => {
    console.log(`[${new Date().toISOString()}] New connection: ${socket.id}`);

    // Store connection
    activeConnections.set(socket.id, {
        connectedAt: new Date(),
        lastActivity: new Date(),
        playerId: null
    });

    // Send connection established event
    socket.emit(SOCKET_EVENTS_SERVER.CONNECTION_ESTABLISHED, {
        socketId: socket.id,
        timestamp: new Date().toISOString(),
        serverInfo: {
            version: '1.0.0',
            environment: NODE_ENV
        }
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // LOBBY EVENTS
    // ═══════════════════════════════════════════════════════════════════════════

    // Create lobby
    socket.on(SOCKET_EVENTS_CLIENT.CREATE_LOBBY, async (data, callback) => {
        try {
            console.log(`[${socket.id}] Creating lobby:`, data);

            // TODO: Validate data and create lobby
            // For now, just acknowledge
            const response = {
                success: true,
                message: 'Lobby creation not yet implemented',
                data: { socketId: socket.id }
            };

            if (callback) callback(response);
        } catch (error) {
            console.error('Error creating lobby:', error);
            const errorResponse = {
                success: false,
                error: {
                    message: 'Failed to create lobby',
                    details: error.message
                }
            };
            if (callback) callback(errorResponse);
        }
    });

    // Join lobby
    socket.on(SOCKET_EVENTS_CLIENT.JOIN_LOBBY, async (data, callback) => {
        try {
            console.log(`[${socket.id}] Joining lobby:`, data);

            // TODO: Implement lobby joining logic
            const response = {
                success: true,
                message: 'Lobby joining not yet implemented',
                data: { socketId: socket.id }
            };

            if (callback) callback(response);
        } catch (error) {
            console.error('Error joining lobby:', error);
            const errorResponse = {
                success: false,
                error: {
                    message: 'Failed to join lobby',
                    details: error.message
                }
            };
            if (callback) callback(errorResponse);
        }
    });

    // Leave lobby
    socket.on(SOCKET_EVENTS_CLIENT.LEAVE_LOBBY, async (data, callback) => {
        try {
            console.log(`[${socket.id}] Leaving lobby:`, data);

            // TODO: Implement lobby leaving logic
            const response = {
                success: true,
                message: 'Lobby leaving not yet implemented'
            };

            if (callback) callback(response);
        } catch (error) {
            console.error('Error leaving lobby:', error);
            const errorResponse = {
                success: false,
                error: {
                    message: 'Failed to leave lobby',
                    details: error.message
                }
            };
            if (callback) callback(errorResponse);
        }
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // GAME EVENTS
    // ═══════════════════════════════════════════════════════════════════════════

    // Submit answer
    socket.on(SOCKET_EVENTS_CLIENT.SUBMIT_ANSWER, async (data, callback) => {
        try {
            console.log(`[${socket.id}] Submitting answer:`, data);

            // TODO: Implement answer submission logic
            const response = {
                success: true,
                message: 'Answer submission not yet implemented'
            };

            if (callback) callback(response);
        } catch (error) {
            console.error('Error submitting answer:', error);
            const errorResponse = {
                success: false,
                error: {
                    message: 'Failed to submit answer',
                    details: error.message
                }
            };
            if (callback) callback(errorResponse);
        }
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // CHAT EVENTS
    // ═══════════════════════════════════════════════════════════════════════════

    // Send message
    socket.on(SOCKET_EVENTS_CLIENT.SEND_MESSAGE, async (data, callback) => {
        try {
            console.log(`[${socket.id}] Sending message:`, data);

            // TODO: Implement chat message logic
            const response = {
                success: true,
                message: 'Chat not yet implemented'
            };

            if (callback) callback(response);
        } catch (error) {
            console.error('Error sending message:', error);
            const errorResponse = {
                success: false,
                error: {
                    message: 'Failed to send message',
                    details: error.message
                }
            };
            if (callback) callback(errorResponse);
        }
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // CONNECTION EVENTS
    // ═══════════════════════════════════════════════════════════════════════════

    // Handle disconnect
    socket.on('disconnect', (reason) => {
        console.log(`[${new Date().toISOString()}] Disconnect: ${socket.id}, reason: ${reason}`);

        const connectionInfo = activeConnections.get(socket.id);
        if (connectionInfo && connectionInfo.playerId) {
            // TODO: Handle player disconnection from lobby/game
            playerSockets.delete(connectionInfo.playerId);

            // Emit player disconnected event
            socket.broadcast.emit(SOCKET_EVENTS_SERVER.PLAYER_DISCONNECTED, {
                playerId: connectionInfo.playerId,
                socketId: socket.id,
                timestamp: new Date().toISOString()
            });
        }

        activeConnections.delete(socket.id);
    });

    // Handle socket errors
    socket.on('error', (error) => {
        console.error(`[${socket.id}] Socket error:`, error);
    });

    // Update activity timestamp on any event
    socket.use((packet, next) => {
        const connectionInfo = activeConnections.get(socket.id);
        if (connectionInfo) {
            connectionInfo.lastActivity = new Date();
        }
        next();
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════════════════════════════════════════

// Express error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: {
            message: 'Route not found',
            path: req.originalUrl,
            method: req.method
        }
    });
});

// Global error handlers
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// ═══════════════════════════════════════════════════════════════════════════
// SERVER STARTUP
// ═══════════════════════════════════════════════════════════════════════════

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
    console.log('\n🚀 Quiz Game Server Started!');
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🌐 Server running on: http://localhost:${PORT}`);
    console.log(`📡 Socket.IO endpoint: http://localhost:${PORT}/socket.io/`);
    console.log(`🔧 Environment: ${NODE_ENV}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`📋 API info: http://localhost:${PORT}/api`);
    console.log(`⏰ Started at: ${new Date().toISOString()}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    if (NODE_ENV === 'development') {
        console.log(`\n💡 Development Tips:`);
        console.log(`   • API endpoints: http://localhost:${PORT}/api`);
        console.log(`   • Health check: http://localhost:${PORT}/health`);
        console.log(`   • Lobby stats: http://localhost:${PORT}/api/stats`);
        console.log(`   • Public lobbies: http://localhost:${PORT}/api/lobbies`);
        console.log(`\n🔧 Next steps:`);
        console.log(`   1. Test the server: curl http://localhost:${PORT}/health`);
        console.log(`   2. Connect with frontend`);
        console.log(`   3. Implement remaining socket handlers\n`);
    }
});

// Export for testing
export { app, io, server };