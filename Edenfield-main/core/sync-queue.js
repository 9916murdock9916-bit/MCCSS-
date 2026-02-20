// core/sync-queue.js

import { Guards } from "./permissions/guards.js";

const QUEUE_KEY = "eden_sync_queue_v500";

export const SyncQueue = {
  items: [],

  load() {
    const raw = localStorage.getItem(QUEUE_KEY);
    this.items = raw ? JSON.parse(raw) : [];
  },

  save() {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(this.items));
  },

  add(action) {
    Guards.syncQueue();

    this.items.push({
      id: crypto.randomUUID(),
      action,
      status: "pending",
      attempts: 0,
      createdAt: new Date().toISOString()
    });
    this.save();
  },

  next() {
    return this.items.find(i => i.status === "pending");
  },

  markSuccess(id) {
    this.items = this.items.filter(i => i.id !== id);
    this.save();
  },

  markFailure(id) {
    const item = this.items.find(i => i.id === id);
    if (!item) return;
    item.attempts++;
    item.status = "failed";
    this.save();
  }
};

SyncQueue.load();
