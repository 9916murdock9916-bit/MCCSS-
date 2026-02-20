// core/sync.js

import { SyncQueue } from "./sync-queue.js";
import { SyncWorker } from "./sync-worker.js";
import { SyncAPI } from "./sync-api.js";
import { Conflict } from "./conflict.js";
import { SyncLog } from "./sync-log.js";
import { Events } from "./events.js";
import { Guards } from "./permissions/guards.js";

export const Sync = {
  init() {
    SyncWorker.start();
  },

  queue(action) {
    Guards.syncQueue();

    SyncQueue.add({
      ...action,
      updatedAt: new Date().toISOString()
    });
  },

  async pull() {
    Guards.syncAll();

    const remote = await SyncAPI.pull();
    Events.emit("sync:pull", remote);
    return remote;
  },

  resolveConflict(local, remote) {
    return Conflict.resolve(local, remote);
  },

  log(entry) {
    SyncLog.add(entry);
  }
};

Sync.init();
