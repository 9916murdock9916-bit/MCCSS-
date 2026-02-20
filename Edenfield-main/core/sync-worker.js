// core/sync-worker.js

import { SyncQueue } from "./sync-queue.js";
import { SyncAPI } from "./sync-api.js";
import { SyncLog } from "./sync-log.js";
import { Network } from "./network.js";
import { Events } from "./events.js";
import { Guards } from "./permissions/guards.js";

export const SyncWorker = {
  running: false,

  start() {
    if (this.running) return;
    this.running = true;

    setInterval(() => this.tick(), 3000);
  },

  async tick() {
    Guards.syncAll();

    if (!Network.isOnline()) {
      Events.emit("sync:offline");
      return;
    }

    const item = SyncQueue.next();
    if (!item) return;

    Events.emit("sync:start", item);

    try {
      const result = await SyncAPI.push(item.action);
      SyncQueue.markSuccess(item.id);

      SyncLog.add({
        type: "push",
        id: item.id,
        action: item.action,
        result
      });

      Events.emit("sync:success", item);
    } catch (e) {
      SyncQueue.markFailure(item.id);

      SyncLog.add({
        type: "error",
        id: item.id,
        error: e.message
      });

      Events.emit("sync:error", { item, error: e });
    }
  }
};
