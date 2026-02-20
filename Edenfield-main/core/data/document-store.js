// core/data/document-store.js

import { Guards } from "../permissions/guards.js";

const KEY = "eden_documents_v500";

export const DocumentStore = {
  collections: {},

  init() {
    const raw = localStorage.getItem(KEY);
    this.collections = raw ? JSON.parse(raw) : {};
  },

  save() {
    localStorage.setItem(KEY, JSON.stringify(this.collections));
  },

  createCollection(name) {
    Guards.dataWrite();
    if (!this.collections[name]) {
      this.collections[name] = [];
      this.save();
    }
  },

  insert(collection, doc) {
    Guards.dataWrite();

    if (!this.collections[collection]) this.createCollection(collection);

    const record = {
      id: crypto.randomUUID(),
      ...doc,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.collections[collection].push(record);
    this.save();
    return record;
  },

  update(collection, id, updates) {
    Guards.dataWrite();

    const col = this.collections[collection];
    if (!col) return null;

    const doc = col.find(d => d.id === id);
    if (!doc) return null;

    Object.assign(doc, updates, { updatedAt: new Date().toISOString() });
    this.save();
    return doc;
  },

  find(collection, filterFn = () => true) {
    Guards.dataRead();

    const col = this.collections[collection] || [];
    return col.filter(filterFn);
  },

  get(collection, id) {
    Guards.dataRead();

    const col = this.collections[collection] || [];
    return col.find(d => d.id === id) || null;
  },

  delete(collection, id) {
    Guards.dataWrite();

    if (!this.collections[collection]) return;
    this.collections[collection] = this.collections[collection].filter(d => d.id !== id);
    this.save();
  }
};
