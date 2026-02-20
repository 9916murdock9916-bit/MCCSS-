// core/permissions/roles.js

export const Roles = {
  registry: {},

  init() {
    this.registry = {
      system: {
        inherits: [],
        capabilities: ["system.full", "data.all", "sync.all", "organism.manage", "lease.manage"]
      },

      user: {
        inherits: [],
        capabilities: ["data.read", "data.write", "sync.queue"]
      },

      organism: {
        inherits: [],
        capabilities: ["data.read", "sync.queue"]
      },

      guest: {
        inherits: [],
        capabilities: ["data.read.public"]
      }
    };
  },

  get(role) {
    return this.registry[role] || null;
  }
};
