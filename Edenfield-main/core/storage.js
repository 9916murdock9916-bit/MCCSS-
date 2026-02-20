// core/storage.js

const PREFIX = "eden_storage_";

export const storage = {
  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.error("Storage set failed", e);
    }
  },

  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      console.error("Storage get failed", e);
      return fallback;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(PREFIX + key);
    } catch (e) {
      console.error("Storage remove failed", e);
    }
  }
};
