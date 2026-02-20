// core/permissions/capabilities.js

export const Capabilities = {
  registry: {},

  init() {
    this.registry = {
      "data.read": { description: "Read non-restricted data" },
      "data.write": { description: "Write non-restricted data" },
      "data.all": { description: "Full data access" },

      "data.read.public": { description: "Read public data only" },

      "sync.queue": { description: "Queue sync actions" },
      "sync.all": { description: "Full sync control" },

      "organism.manage": { description: "Install, remove, or modify organisms" },

      "lease.manage": { description: "Manage leases and tenant assignments" },

      "system.full": { description: "Full substrate authority" }
    };
  },

  exists(cap) {
    return !!this.registry[cap];
  }
};
