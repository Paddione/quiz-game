### 🔄 Project Awareness & Context
- **Always read `PLANNING.md`** at the start of a new conversation to understand the project's architecture, goals, style, and constraints.
- **Check `TASK.md`** before starting a new task. If the task isn’t listed, add it with a brief description and today's date.
- **Use consistent naming conventions, file structure, and architecture patterns** as described in `PLANNING.md`.

### 🧱 Code Structure & Modularity
- **Never create a file longer than 500 lines of code.** If a file approaches this limit, refactor by splitting it into modules or helper files.
- **Organize code into clearly separated modules**, grouped by feature or responsibility.
- **Use clear, consistent imports** (prefer relative imports within packages).

### 🧪 Testing & Reliability
- **Always create Jest unit tests for new features** (functions, classes, routes, etc).
- **After updating any logic**, check whether existing unit tests need to be updated. If so, do it.
- **Tests should live in a `/tests` folder** mirroring the main app structure.
    - Include at least:
        - 1 test for expected use
        - 1 edge case
        - 1 failure case

### ✅ Task Completion
- **Mark completed tasks in `TASK.md`** immediately after finishing them.
- Add new sub-tasks or TODOs discovered during development to `TASK.md` under a “Discovered During Work” section.

### 📎 Style & Conventions
- **Javascript** as the primary language.
- **Follow Airbnb JavaScript Style Guide**, use type hints, and format with `black`.
- **Use `Zod` for data validation**.
- Use `NestJS` for APIs and `Prisma` for ORM if applicable.
- Write **JSDoc comments for every function** using the Google style:
  /**
* Brief summary.
*
* @param {string} param1 Description of the first parameter.
* @param {number} param2 Description of the second parameter.
* @returns {boolean} Description of the return value.
  */
  function example(param1, param2) {
  // function implementation
  return true;
*

### 📚 Documentation & Explainability
- **Update `README.md`** when new features are added, dependencies change, or setup steps are modified.
- **Comment non-obvious code** and ensure everything is understandable to a mid-level developer.
- When writing complex logic, **add an inline `# Reason:` comment** explaining the why, not just the what.

### 🧠 AI Behavior Rules
- **Never assume missing context. Ask questions if uncertain.**
- **Never hallucinate libraries or functions** – only use known, verified Javascript packages.
- **Always confirm file paths and module names** exist before referencing them in code or tests.
- **Never delete or overwrite existing code** unless explicitly instructed to or if part of a task from `TASK.md`.

# 🎯 Extended PLANNING.md - Quiz Game Rebuild

## 📋 Current State Analysis

### Strengths of Current Implementation
- **Well-structured modular architecture** with clear separation of concerns
- **Comprehensive feature set** including auth, lobbies, real-time gameplay
- **Good documentation** and JSDoc comments
- **Modern tech stack** (Node.js, Socket.IO, Firebase, Tailwind CSS)
- **Production-ready deployment** with Docker and Traefik

### Areas for Improvement
- **Code organization**: Some files exceed 500 lines (ui.js ~900+ lines)
- **Testing coverage**: Missing unit tests entirely
- **Error handling**: Inconsistent error handling patterns
- **Type safety**: No TypeScript or comprehensive Zod validation
- **Performance**: Potential memory leaks with timers and socket connections
- **Security**: Missing rate limiting on game actions

---

## 🎯 Rebuild Strategy

### Phase 1: Foundation & Architecture
1. **Enhanced Project Structure**
2. **Testing Framework Setup**
3. **Improved Error Handling**
4. **Code Splitting & Modularity**

### Phase 2: Core Systems Rebuild
1. **Authentication Service**
2. **Lobby Management**
3. **Game Engine**
4. **Real-time Communication**

### Phase 3: Client-Side Improvements
1. **Modular UI Components**
2. **State Management**
3. **Enhanced UX/UI**

### Phase 4: Testing & Deployment
1. **Comprehensive Testing**
2. **Performance Optimization**
3. **Security Hardening**
4. **Production Deployment**

---

## 🏗️ Enhanced Project Structure

```
quiz-game/
├── 📁 shared/                          # Shared utilities and types
│   ├── types.js                        # Type definitions with JSDoc
│   ├── constants.js                    # Game constants
│   ├── validation.js                   # Zod schemas
│   └── utils.js                        # Shared utility functions
│
├── 📁 auth-server/                     # Authentication microservice
│   ├── src/
│   │   ├── controllers/                # Route controllers (max 200 lines each)
│   │   │   ├── auth.controller.js
│   │   │   └── profile.controller.js
│   │   ├── services/                   # Business logic services
│   │   │   ├── auth.service.js
│   │   │   └── user.service.js
│   │   ├── middleware/                 # Custom middleware
│   │   │   ├── auth.middleware.js
│   │   │   └── validation.middleware.js
│   │   ├── routes/                     # Route definitions
│   │   │   ├── auth.routes.js
│   │   │   └── profile.routes.js
│   │   ├── config/                     # Configuration management
│   │   │   ├── database.config.js
│   │   │   └── firebase.config.js
│   │   └── app.js                      # Express app setup
│   ├── tests/                          # Unit and integration tests
│   │   ├── controllers/
│   │   ├── services/
│   │   └── utils/
│   ├── public/                         # Static auth UI files
│   ├── package.json
│   └── Dockerfile
│
├── 📁 game-server/                     # Game logic microservice
│   ├── src/
│   │   ├── controllers/                # Game controllers
│   │   │   ├── lobby.controller.js
│   │   │   ├── game.controller.js
│   │   │   └── leaderboard.controller.js
│   │   ├── services/                   # Game services
│   │   │   ├── lobby.service.js
│   │   │   ├── game.service.js
│   │   │   ├── question.service.js
│   │   │   └── scoring.service.js
│   │   ├── managers/                   # State managers
│   │   │   ├── lobbyManager.js
│   │   │   ├── gameManager.js
│   │   │   └── socketManager.js
│   │   ├── middleware/                 # Game middleware
│   │   │   ├── socketAuth.middleware.js
│   │   │   └── rateLimit.middleware.js
│   │   ├── models/                     # Data models
│   │   │   ├── lobby.model.js
│   │   │   ├── player.model.js
│   │   │   └── game.model.js
│   │   ├── utils/                      # Game utilities
│   │   │   ├── timer.utils.js
│   │   │   └── scoring.utils.js
│   │   ├── config/                     # Configuration
│   │   │   ├── socket.config.js
│   │   │   └── game.config.js
│   │   └── server.js                   # Server entry point
│   ├── tests/                          # Comprehensive tests
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   ├── data/
│   │   └── questions.json
│   ├── public/                         # Client-side code
│   │   ├── js/
│   │   │   ├── components/             # UI components (max 300 lines each)
│   │   │   │   ├── auth/
│   │   │   │   │   ├── loginForm.js
│   │   │   │   │   └── guestForm.js
│   │   │   │   ├── lobby/
│   │   │   │   │   ├── lobbyList.js
│   │   │   │   │   ├── playerList.js
│   │   │   │   │   └── hostControls.js
│   │   │   │   ├── game/
│   │   │   │   │   ├── questionCard.js
│   │   │   │   │   ├── answerOptions.js
│   │   │   │   │   ├── timer.js
│   │   │   │   │   └── scoreboard.js
│   │   │   │   └── common/
│   │   │   │       ├── modal.js
│   │   │   │       ├── notification.js
│   │   │   │       └── loading.js
│   │   │   ├── services/               # Client services
│   │   │   │   ├── api.service.js
│   │   │   │   ├── socket.service.js
│   │   │   │   ├── auth.service.js
│   │   │   │   └── audio.service.js
│   │   │   ├── stores/                 # State management
│   │   │   │   ├── appStore.js
│   │   │   │   ├── authStore.js
│   │   │   │   ├── lobbyStore.js
│   │   │   │   └── gameStore.js
│   │   │   ├── utils/                  # Client utilities
│   │   │   │   ├── dom.utils.js
│   │   │   │   ├── validation.utils.js
│   │   │   │   └── storage.utils.js
│   │   │   └── main.js                 # Entry point
│   │   ├── css/
│   │   │   ├── components/             # Component-specific styles
│   │   │   ├── base.css                # Base styles
│   │   │   └── main.css                # Main stylesheet
│   │   └── index.html
│   ├── package.json
│   └── Dockerfile
│
├── 📁 tests/                           # Cross-service tests
│   ├── e2e/                            # End-to-end tests
│   ├── performance/                    # Performance tests
│   └── integration/                    # Integration tests
│
├── 📁 docs/                            # Documentation
│   ├── api/                            # API documentation
│   ├── architecture/                   # Architecture docs
│   ├── deployment/                     # Deployment guides
│   └── development/                    # Development guides
│
├── docker-compose.yml                  # Multi-service orchestration
├── docker-compose.dev.yml              # Development environment
├── .github/workflows/                  # CI/CD pipelines
└── README.md                           # Project overview
```

---

## 🧩 Code Organization Principles

### File Size Limits
- **Controllers**: Max 200 lines
- **Services**: Max 300 lines
- **Components**: Max 300 lines
- **Utilities**: Max 150 lines
- **Models**: Max 100 lines

### Naming Conventions
```javascript
// Files: kebab-case
auth.service.js
lobby.controller.js
player.model.js

// Classes: PascalCase
class LobbyManager {}
class GameSession {}

// Functions: camelCase
function createLobby() {}
function validatePlayer() {}

// Constants: SCREAMING_SNAKE_CASE
const MAX_PLAYERS = 8;
const QUESTION_TIME_LIMIT = 60;
```

### Import/Export Standards
```javascript
// Prefer named exports
export { createLobby, joinLobby };

// Default exports only for main classes/components
export default class LobbyService {}

// Consistent import grouping
// 1. Node modules
// 2. Shared modules
// 3. Local modules
import express from 'express';
import { validateLobbyId } from '../../shared/validation.js';
import { LobbyService } from '../services/lobby.service.js';
```

---

## 🧪 Testing Strategy

### Testing Framework Setup
```javascript
// jest.config.js
export default {
    testEnvironment: 'node',
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/**/*.test.js',
        '!src/**/*.spec.js'
    ],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
        }
    }
};
```

### Test Categories
1. **Unit Tests**: Individual functions and classes
2. **Integration Tests**: Service interactions
3. **E2E Tests**: Complete user workflows
4. **Performance Tests**: Load and stress testing

### Test Examples Structure
```javascript
// Example: lobby.service.test.js
describe('LobbyService', () => {
    describe('createLobby', () => {
        test('should create lobby with valid host', () => {
            // Arrange
            const hostData = { id: 'user123', name: 'TestUser' };

            // Act
            const lobby = lobbyService.createLobby(hostData);

            // Assert
            expect(lobby).toHaveProperty('id');
            expect(lobby.hostId).toBe('user123');
            expect(lobby.players).toHaveLength(1);
        });

        test('should throw error with invalid host data', () => {
            // Arrange
            const invalidHost = null;

            // Act & Assert
            expect(() => lobbyService.createLobby(invalidHost))
                .toThrow('Invalid host data');
        });
    });
});
```

---

## 🛡️ Enhanced Error Handling

### Error Classes
```javascript
// shared/errors.js
export class QuizGameError extends Error {
    constructor(message, code, statusCode = 500) {
        super(message);
        this.name = 'QuizGameError';
        this.code = code;
        this.statusCode = statusCode;
    }
}

export class ValidationError extends QuizGameError {
    constructor(message, field) {
        super(message, 'VALIDATION_ERROR', 400);
        this.field = field;
    }
}

export class LobbyError extends QuizGameError {
    constructor(message, lobbyId) {
        super(message, 'LOBBY_ERROR', 400);
        this.lobbyId = lobbyId;
    }
}

export class AuthenticationError extends QuizGameError {
    constructor(message) {
        super(message, 'AUTH_ERROR', 401);
    }
}
```

### Error Handling Middleware
```javascript
// game-server/src/middleware/errorHandler.middleware.js
export function errorHandler(error, req, res, next) {
    console.error('Error occurred:', {
        error: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
    });

    if (error instanceof QuizGameError) {
        return res.status(error.statusCode).json({
            success: false,
            error: {
                code: error.code,
                message: error.message,
                ...(error.field && { field: error.field })
            }
        });
    }

    // Unhandled errors
    res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_ERROR',
            message: 'Ein unerwarteter Fehler ist aufgetreten'
        }
    });
}
```

---

## 🔄 State Management Architecture

### Client-Side Store Pattern
```javascript
// game-server/public/js/stores/appStore.js
class AppStore {
    constructor() {
        this.state = {
            currentScreen: 'loading',
            connectionStatus: 'disconnected',
            userInteracted: false,
            isMuted: this.getStoredMuteState()
        };
        this.listeners = new Set();
    }

    setState(updates) {
        const previousState = { ...this.state };
        this.state = { ...this.state, ...updates };

        this.notifyListeners(previousState, this.state);
    }

    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    notifyListeners(previousState, currentState) {
        this.listeners.forEach(listener => {
            listener(currentState, previousState);
        });
    }

    getStoredMuteState() {
        return localStorage.getItem('quizMuted') === 'true';
    }
}

export const appStore = new AppStore();
```

---

## 🚀 Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Set up new project structure
- [ ] Configure testing framework
- [ ] Implement shared utilities and types
- [ ] Set up development environment

### Phase 2: Auth Service (Week 2)
- [ ] Rebuild authentication controller
- [ ] Implement user service with proper validation
- [ ] Add comprehensive auth tests
- [ ] Set up Firebase admin integration

### Phase 3: Game Core (Week 3)
- [ ] Implement lobby management system
- [ ] Build game engine with proper state management
- [ ] Add question and scoring services
- [ ] Implement Socket.IO handlers

### Phase 4: Client Rebuild (Week 4)
- [ ] Create modular UI components
- [ ] Implement client-side state management
- [ ] Build responsive game interface
- [ ] Add audio and visual feedback

### Phase 5: Testing & Polish (Week 5)
- [ ] Complete test coverage
- [ ] Performance optimization
- [ ] Security audit
- [ ] Documentation completion

### Phase 6: Deployment (Week 6)
- [ ] Production deployment setup
- [ ] CI/CD pipeline configuration
- [ ] Monitoring and logging
- [ ] Final testing and launch

---

## 📏 Quality Standards

### Code Quality Metrics
- **Test Coverage**: Minimum 80%
- **File Size**: Respect maximum line limits
- **Complexity**: Maximum cyclomatic complexity of 10
- **Documentation**: JSDoc for all public functions

### Performance Targets
- **Page Load**: < 2 seconds
- **Socket Response**: < 100ms
- **Memory Usage**: Stable, no leaks
- **Concurrent Users**: Support 100+ simultaneous players

### Security Requirements
- **Input Validation**: All inputs validated with Zod
- **Rate Limiting**: API and Socket.IO endpoints protected
- **Authentication**: Secure Firebase token validation
- **Data Sanitization**: All user inputs sanitized

---

## 🔧 Development Tools & Scripts

### Package.json Scripts
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:auth\" \"npm run dev:game\"",
    "dev:auth": "cd auth-server && nodemon src/app.js",
    "dev:game": "cd game-server && nodemon src/server.js",
    "test": "jest --coverage",
    "test:watch": "jest --watch",
    "test:e2e": "jest --config=jest.e2e.config.js",
    "lint": "eslint . --ext .js",
    "lint:fix": "eslint . --ext .js --fix",
    "build": "docker-compose build",
    "start:prod": "docker-compose up -d",
    "docs:generate": "jsdoc src/ -d docs/",
    "security:audit": "npm audit && snyk test"
  }
}
```

---

## 📝 Next Steps

1. **Review and approve** this extended planning document
2. **Create TASKS.md** with detailed implementation tasks
3. **Set up development environment** with new structure
4. **Begin Phase 1** implementation
5. **Establish regular review checkpoints** for each phase

This enhanced planning provides a solid foundation for rebuilding the quiz game with better architecture, comprehensive testing, and improved maintainability while preserving all existing functionality.