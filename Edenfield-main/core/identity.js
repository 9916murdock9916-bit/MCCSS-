// core/identity.js

const STORAGE_KEY = "eden_identity";

export const identity = {
  data: null,

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      this.data = raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error("Failed to load identity", e);
      this.data = null;
    }
    return this.data;
  },

  save(profile) {
    this.data = profile;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error("Failed to save identity", e);
    }
  },

  exists() {
    return this.data !== null;
  }
};
