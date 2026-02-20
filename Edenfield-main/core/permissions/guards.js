
import { Enforcement } from "./enforce.js";

export const Guards = {
  dataRead(organismId = null) {
    return Enforcement.require("data.read", { organism: organismId });
  },

  dataWrite(organismId = null) {
    return Enforcement.require("data.write", { organism: organismId });
  },

  dataAll(organismId = null) {
    return Enforcement.require("data.all", { organism: organismId });
  },

  syncQueue(organismId = null) {
    return Enforcement.require("sync.queue", { organism: organismId });
  },

  syncAll(organismId = null) {
    return Enforcement.require("sync.all", { organism: organismId });
  },

  organismManage(organismId = null) {
    return Enforcement.require("organism.manage", { organism: organismId });
  },

  systemFull() {
    return Enforcement.require("system.full");
  }
};

