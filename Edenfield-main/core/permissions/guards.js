
import { Enforcement } from "./enforce.js";

export const Guards = {
  dataRead() {
    Enforcement.require("data.read");
  },

  dataWrite() {
    Enforcement.require("data.write");
  },

  dataAll() {
    Enforcement.require("data.all");
  },

  syncQueue() {
    Enforcement.require("sync.queue");
  },

  syncAll() {
    Enforcement.require("sync.all");
  },

  organismManage() {
    Enforcement.require("organism.manage");
  },

  systemFull() {
    Enforcement.require("system.full");
  }
};

