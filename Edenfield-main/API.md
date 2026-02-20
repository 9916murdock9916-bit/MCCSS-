# API Documentation

Complete API reference for Eden Field modules.

## Table of Contents

- [Sync API](#sync-api)
- [Identity API](#identity-api)
- [State API](#state-api)
- [Events API](#events-api)
- [Permissions API](#permissions-api)
- [Data API](#data-api)
- [Storage API](#storage-api)
- [Router API](#router-api)

---

## Sync API

The synchronization engine for distributed state management.

### `Sync.init()`

Initialize the sync system and start the sync worker.

**Returns**: `void`

**Throws**: Nothing

**Example**:
```javascript
import { Sync } from "./core/sync.js";
Sync.init();
```

### `Sync.queue(action)`

Queue an action for synchronization to the remote server.

**Parameters**:
- `action` (Object): The action to queue
  - `type` (string): Action type - 'create', 'update', 'delete', etc.
  - `entity` (string): Entity type - 'document', 'user', etc.
  - `id` (string): Unique identifier for the entity
  - `data` (Object): Action payload/data

**Returns**: `void`

**Throws**: 
- `Error` if user lacks 'syncQueue' capability

**Example**:
```javascript
Sync.queue({
  type: "update",
  entity: "document",
  id: "doc-123",
  data: {
    title: "Updated Title",
    modified: new Date().toISOString()
  }
});
```

### `Sync.pull()`

Fetch remote changes and merge them with local state.

**Returns**: `Promise<Array>` - Array of remote changes

**Throws**:
- `Error` if user lacks 'syncAll' capability
- Network errors during pull operation

**Example**:
```javascript
try {
  const changes = await Sync.pull();
  console.log(`Pulled ${changes.length} changes`);
} catch (err) {
  console.error("Pull failed:", err);
}
```

### `Sync.resolveConflict(localVersion, remoteVersion)`

Resolve a conflict between local and remote versions.

**Parameters**:
- `localVersion` (Object): Local version of the document
- `remoteVersion` (Object): Remote version of the document

**Returns**: `Object` - Resolved version

**Algorithm**: Uses timestamp comparison; remote version wins if newer

**Example**:
```javascript
const resolved = Sync.resolveConflict(
  { title: "Local Title", updatedAt: "2024-01-01T00:00:00Z" },
  { title: "Remote Title", updatedAt: "2024-01-02T00:00:00Z" }
);
// Returns remote version (newer timestamp)
```

### `Sync.log(entry)`

Add an entry to the sync log for auditing.

**Parameters**:
- `entry` (Object): Log entry
  - `action` (string): Action that was performed
  - `timestamp` (string): ISO timestamp
  - `user` (string): User who performed action
  - `status` (string): 'success' or 'failed'

**Returns**: `void`

**Example**:
```javascript
Sync.log({
  action: "sync:complete",
  timestamp: new Date().toISOString(),
  user: "user-123",
  status: "success"
});
```

---

## Identity API

User identity and profile management.

### `identity.load()`

Load user identity from persistent storage.

**Returns**: `Object|null` - User identity or null if not found

**Example**:
```javascript
import { identity } from "./core/identity.js";

const user = identity.load();
if (user) {
  console.log(`Logged in as: ${user.name}`);
} else {
  console.log("No identity loaded");
}
```

### `identity.save(profile)`

Save user identity to persistent storage.

**Parameters**:
- `profile` (Object): User profile object
  - `id` (string): Unique user ID
  - `name` (string): User name
  - `email` (string): User email
  - `roles` (Array): User roles

**Returns**: `void`

**Throws**: If storage quota exceeded

**Example**:
```javascript
identity.save({
  id: "user-123",
  name: "Alice",
  email: "alice@example.com",
  roles: ["editor"]
});
```

### `identity.exists()`

Check if user identity is loaded.

**Returns**: `boolean` - true if identity exists

**Example**:
```javascript
if (identity.exists()) {
  // User is logged in
  Sync.queue({ type: "create", entity: "document" });
}
```

---

## State API

Centralized state management.

### `State.subscribe(path, callback)`

Subscribe to state changes at a specific path.

**Parameters**:
- `path` (string): Dot-notation path to state value
- `callback` (Function): Called when state changes
  - `newValue`: New state value
  - `oldValue`: Previous state value

**Returns**: `Function` - Unsubscribe function

**Example**:
```javascript
import { State } from "./core/state.js";

const unsubscribe = State.subscribe("user.name", (newName, oldName) => {
  console.log(`Name changed from ${oldName} to ${newName}`);
});

// Later, unsubscribe
unsubscribe();
```

### `State.update(path, value)`

Update state at a specific path.

**Parameters**:
- `path` (string): Dot-notation path
- `value` (any): New value

**Returns**: `void`

**Emits**: `state:change` event

**Example**:
```javascript
State.update("user.name", "Bob");
State.update("documents", [...Array]);
```

### `State.get(path)`

Get state value at a specific path.

**Parameters**:
- `path` (string): Dot-notation path

**Returns**: `any` - State value or undefined

**Example**:
```javascript
const userName = State.get("user.name");
const allDocuments = State.get("documents");
```

---

## Events API

Event emission and subscription system.

### `Events.on(event, listener)`

Subscribe to an event.

**Parameters**:
- `event` (string): Event name
- `listener` (Function): Event handler

**Returns**: `void`

**Example**:
```javascript
import { Events } from "./core/events.js";

Events.on("sync:start", () => {
  console.log("Sync starting...");
});

Events.on("sync:complete", (data) => {
  console.log(`Sync complete: ${data.count} changes`);
});
```

### `Events.once(event, listener)`

Subscribe to an event, fires only once.

**Parameters**:
- `event` (string): Event name
- `listener` (Function): Event handler

**Returns**: `void`

**Example**:
```javascript
Events.once("app:ready", () => {
  console.log("App is ready!");
});
```

### `Events.off(event, listener)`

Unsubscribe from an event.

**Parameters**:
- `event` (string): Event name
- `listener` (Function): Event handler to remove

**Returns**: `void`

**Example**:
```javascript
const handler = (data) => console.log(data);
Events.on("update", handler);
// Later...
Events.off("update", handler);
```

### `Events.emit(event, data)`

Emit an event.

**Parameters**:
- `event` (string): Event name
- `data` (any): Event payload

**Returns**: `void`

**Example**:
```javascript
Events.emit("document:created", {
  id: "doc-123",
  title: "My Document"
});
```

### Built-in Events

- `sync:start` - Sync operation starting
- `sync:complete` - Sync operation complete with changes
- `sync:error` - Sync operation failed
- `sync:pull` - Remote changes pulled
- `conflict:detected` - Conflict between local/remote
- `conflict:resolved` - Conflict has been resolved
- `state:change` - State has been updated
- `user:login` - User logged in
- `user:logout` - User logged out

---

## Permissions API

Role-based access control and capability checking.

### `Guards.require(capability)`

Assert that user has a specific capability.

**Parameters**:
- `capability` (string): Capability name

**Returns**: `void`

**Throws**: 
- `Error` if user lacks capability

**Example**:
```javascript
import { Guards } from "./core/permissions/guards.js";

Guards.require("deleteDocument");
// Throws if user can't delete documents
document.delete();
```

### `Guards.checkPermission(capability)`

Check if user has a capability without throwing.

**Parameters**:
- `capability` (string): Capability name

**Returns**: `boolean` - true if user has capability

**Example**:
```javascript
if (Guards.checkPermission("admin")) {
  // Show admin panel
}
```

### `Guards.syncQueue()`

Check permission for queueing sync operations.

**Throws**: `Error` if not allowed

### `Guards.syncAll()`

Check permission for pulling all remote data.

**Throws**: `Error` if not allowed

---

## Data API

Data storage and retrieval.

### DocumentStore

```javascript
import { DocumentStore } from "./core/data/document-store.js";

// Create
const doc = await DocumentStore.create({
  title: "My Document",
  content: "Content here"
});

// Read
const doc = await DocumentStore.get("doc-id");

// Update
await DocumentStore.update("doc-id", { title: "New Title" });

// Delete
await DocumentStore.delete("doc-id");

// Query
const docs = await DocumentStore.query({ title: "My" });
```

### TableStore

```javascript
import { TableStore } from "./core/data/table-store.js";

// Create with schema
const table = await TableStore.create({ 
  name: "users",
  schema: { id: "string", name: "string", email: "string" }
});

// Insert
await table.insert({ id: "1", name: "Alice", email: "alice@example.com" });

// Query
const results = await table.query({ name: "Alice" });
```

---

## Storage API

Persistent storage abstraction.

```javascript
import { Storage } from "./core/storage.js";

// Set
await Storage.set("key", value);

// Get
const value = await Storage.get("key");

// Delete
await Storage.delete("key");

// Clear all
await Storage.clear();
```

---

## Router API

Client-side navigation and routing.

```javascript
import { Router } from "./core/router.js";

// Navigate
Router.navigate("/documents/doc-123");

// Get current path
const path = Router.getCurrentPath();

// Register route
Router.on("documents/:id", (params) => {
  console.log(`Viewing document: ${params.id}`);
});
```

---

## Event Emission

See the example implementations in each module's export for complete usage patterns.

## Error Handling

All async operations should include error handling:

```javascript
try {
  await Sync.pull();
} catch (error) {
  console.error("Sync failed:", error.message);
  // Handle error
}
```

## Best Practices

1. Always check permissions before sensitive operations
2. Subscribe to relevant events instead of polling
3. Use dot notation for deeply nested state
4. Unsubscribe from events when components unmount
5. Log errors for debugging and monitoring
6. Validate data before storing

---

For complete examples and patterns, see [CONTRIBUTING.md](CONTRIBUTING.md).
