# Eden Field - Architecture

## Overview

Eden Field is a sophisticated distributed substrate designed for building real-time, conflict-aware applications with robust identity and permission management. It provides a comprehensive foundation for state synchronization, offline-first operation, and distributed consensus.

## Core Architecture

### System Layers

```
┌─────────────────────────────────────────────┐
│         User Interface Layer               │
│         (app.js, index.html)               │
└────────────────┬────────────────────────────┘
                 │
┌─────────────────────────────────────────────┐
│      Router & Navigation                   │
│         (core/router.js)                   │
└────────────────┬────────────────────────────┘
                 │
┌─────────────────────────────────────────────┐
│   State Management & Events                │
│  (core/state.js, core/events.js)          │
└────────────────┬────────────────────────────┘
                 │
┌─────────────────────────────────────────────┐
│   Permissions & Authorization              │
│  (core/permissions/)                       │
└────────────────┬────────────────────────────┘
                 │
┌─────────────────────────────────────────────┐
│  Data Layer & Storage                      │
│  (core/data/, core/storage.js)             │
└────────────────┬────────────────────────────┘
                 │
┌─────────────────────────────────────────────┐
│  Sync Engine & Conflict Resolution         │
│  (core/sync.js, core/conflict.js)          │
└────────────────┬────────────────────────────┘
                 │
┌─────────────────────────────────────────────┐
│  Network & API                             │
│  (core/network.js, core/sync-api.js)       │
└─────────────────────────────────────────────┘
```

## Module Breakdown

### Core Modules

#### `identity.js`
- Manages user identity and profile information
- Handles persistent storage of identity data
- Provides identity existence checks
- **Key Methods**: `load()`, `save()`, `exists()`

#### `sync.js` - Sync Engine
The heart of the distributed system:
- **Queue Management**: Buffers actions for asynchronous sync
- **Pull Operations**: Fetches remote state changes
- **Conflict Resolution**: Handles merge conflicts between local and remote state
- **Logging**: Maintains sync event history
- **Permission Guards**: Enforces authorization during sync operations

#### `conflict.js`
- Implements conflict resolution strategies
- Determines canonical truth during synchronization
- Supports multiple resolution algorithms (last-write-wins, three-way merge, etc.)

#### `state.js`
- Central state management
- Provides reactive state updates
- Manages subscribers and observers

#### `events.js`
- Event emission and subscription system
- Enables decoupled communication between modules
- Supports selective event filtering

#### `storage.js`
- Abstracts storage layer (localStorage, IndexedDB, etc.)
- Handles persistence of application state
- Provides transaction-like semantics

### Sync System (`core/sync-*.js`)

#### `sync-queue.js`
- Buffers pending actions
- Maintains ordering guarantees
- Supports deduplication

#### `sync-worker.js`
- Background processing of sync queue
- Manages batching and throttling
- Handles retry logic

#### `sync-api.js`
- Network communication with remote sync service
- Implements pull/push protocols
- Handles transport-level concerns

#### `sync-log.js`
- Maintains audit trail of sync operations
- Provides forensic capabilities
- Enables recovery scenarios

### Data Layer (`core/data/`)

#### `document-store.js`
- Stores individual documents
- Supports CRUD operations
- Manages document versioning

#### `table-store.js`
- Manages tabular data
- Supports queries and filtering
- Provides transaction boundaries

#### `import.js` / `export.js`
- Data serialization and deserialization
- Format conversion (JSON, CSV, etc.)
- Data migration support

### Permissions System (`core/permissions/`)

#### `roles.js`
- Defines user roles
- Manages role hierarchy

#### `capabilities.js`
- Defines granular permissions
- Maps capabilities to actions

#### `guards.js`
- Enforces authorization checks
- Blocks unauthorized operations
- Audit logging of permission decisions

#### `context.js`
- Maintains authorization context
- Thread-local state for permission checks

#### `enforce.js`
- Applies permission policies
- Middleware for operation validation

### Network (`core/network.js`)

- Handles HTTP/WebSocket communication
- Manages connection state
- Implements retry and backoff strategies
- Supports streaming and chunking

### Router (`core/router.js`)

- Client-side routing
- URL state synchronization
- Navigation guards based on permissions

## Data Flow

### Normal Operation Flow

```
User Action
    ↓
Router / Event Handler
    ↓
Permission Check (Guards)
    ↓
State Update
    ↓
Sync Queue ← (async)
    ↓
Sync Worker
    ↓
Network (SyncAPI)
    ↓
Remote Sync
```

### Conflict Resolution Flow

```
Local Change + Remote Change
    ↓
Merge Detection
    ↓
Conflict Resolution Algorithm
    ↓
Reconciled State
    ↓
Local Storage Update
    ↓
UI Update
```

## Key Design Decisions

### 1. Module Isolation
Each module has a single responsibility and exports a public API. This enables:
- Easy testing and mocking
- Clear dependency boundaries
- Reduced coupling

### 2. Event-Driven Architecture
Modules communicate via events rather than direct function calls:
- Decouples producers from consumers
- Enables plugin architecture
- Supports multiple listeners

### 3. Permission Checks at Boundaries
Authorization enforced at:
- Queue operations (before sync)
- API calls (before network)
- State mutations (before storage)

### 4. Conflict-Aware Sync
Built-in support for:
- Detecting concurrent modifications
- Multiple resolution strategies
- Manual conflict review and resolution

### 5. Offline-First
- All operations queue locally
- Works without network
- Sync when connectivity restored

## Performance Considerations

- **Sync Batching**: Multiple changes batched into single network request
- **Debouncing**: UI events throttled to prevent excessive updates
- **Lazy Loading**: Core modules loaded on demand
- **IndexedDB**: Large datasets stored in IndexedDB for faster access
- **Service Worker**: Caches static assets and enables offline operation

## Security Architecture

- **Role-Based Access Control (RBAC)**: Fine-grained permissions
- **Capability-Based Model**: Explicit capability grants
- **Audit Logging**: All permission checks logged
- **Input Validation**: All user input validated before processing
- **Secure Storage**: Sensitive data encrypted before persistence

## Extensibility Points

1. **Custom Sync Strategies**: Override `Sync` module
2. **Custom Conflict Resolvers**: Extend `Conflict` module
3. **Custom Storage Backends**: Implement `storage.js` interface
4. **Custom Permissions**: Add roles and capabilities
5. **Event Listeners**: Subscribe to system events

## Testing Strategy

- **Unit Tests**: Individual modules tested in isolation
- **Integration Tests**: Module interactions tested
- **E2E Tests**: Full workflow testing with real scenarios
- **Performance Tests**: Sync performance under load
- **Security Tests**: Permission enforcement validation

## Deployment Architecture

- **Frontend**: Static files served from CDN
- **Service Worker**: Enables offline functionality
- **Backend Sync Service**: Handles pull/push of state changes
- **Database**: Persistent storage of canonical state
- **Message Queue**: Buffers sync operations

## Future Enhancements

- [ ] P2P sync support (WebRTC)
- [ ] Incremental sync with checksums
- [ ] Partial replication
- [ ] Advanced conflict resolution (operational transforms)
- [ ] Encryption at rest and in transit
- [ ] Time-travel debugging
