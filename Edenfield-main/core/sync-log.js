// core/sync-log.js

const LOG_KEY = "eden_sync_log_v500";

export const SyncLog = {
  entries: [],

  load() {
    const raw = localStorage.getItem(LOG_KEY);
    this.entries = raw ? JSON.parse(raw) : [];
  },

  save() {
    localStorage.setItem(LOG_KEY, JSON.stringify(this.entries));
  },

  add(entry) {
    this.entries.push({
      ...entry,
      timestamp: new Date().toISOString()
    });
    this.save();
  }
};

SyncLog.load();
