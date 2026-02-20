// core/sync-api.js

export const SyncAPI = {
  base: "https://edenfield-sync.example.com", // replace with real endpoint

  async push(action) {
    const res = await fetch(`${this.base}/sync/push`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(action)
    });

    if (!res.ok) throw new Error("Push failed");
    return res.json();
  },

  async pull() {
    const res = await fetch(`${this.base}/sync/pull`);
    if (!res.ok) throw new Error("Pull failed");
    return res.json();
  }
};
