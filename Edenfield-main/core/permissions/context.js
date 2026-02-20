// core/permissions/context.js

export const PermissionContext = {
  current: {
    role: "guest",
    organism: null,
    dynamicCaps: []
  },

  setRole(role) {
    this.current.role = role;
  },

  setOrganism(id) {
    this.current.organism = id;
  },

  grantDynamic(cap) {
    if (!this.current.dynamicCaps.includes(cap)) {
      this.current.dynamicCaps.push(cap);
    }
  },

  revokeDynamic(cap) {
    this.current.dynamicCaps = this.current.dynamicCaps.filter(c => c !== cap);
  }
};
