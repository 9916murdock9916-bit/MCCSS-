export const edenState = {
  bootedAt: null,
  online: true,
  version: "v500",
  device: null,

  sync: {
    lastSuccess: null,
    lastError: null,
    pending: 0
  },

  data: {
    collections: 0,
    tables: 0
  }
};
