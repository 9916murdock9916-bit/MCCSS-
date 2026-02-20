// core/data/table-store.js

import { Guards } from "../permissions/guards.js";

const KEY = "eden_tables_v500";

export const TableStore = {
  tables: {},

  init() {
    const raw = localStorage.getItem(KEY);
    this.tables = raw ? JSON.parse(raw) : {};
  },

  save() {
    localStorage.setItem(KEY, JSON.stringify(this.tables));
  },

  createTable(name, schema) {
    Guards.dataWrite();

    if (!this.tables[name]) {
      this.tables[name] = {
        schema,
        rows: []
      };
      this.save();
    }
  },

  insert(table, row) {
    Guards.dataWrite();

    const t = this.tables[table];
    if (!t) throw new Error(`Table ${table} does not exist`);

    const validated = {};
    for (const field in t.schema) {
      validated[field] = row[field] ?? t.schema[field].default ?? null;
    }

    validated.id = crypto.randomUUID();
    validated.createdAt = new Date().toISOString();
    validated.updatedAt = new Date().toISOString();

    t.rows.push(validated);
    this.save();
    return validated;
  },

  update(table, id, updates) {
    Guards.dataWrite();

    const t = this.tables[table];
    if (!t) return null;

    const row = t.rows.find(r => r.id === id);
    if (!row) return null;

    Object.assign(row, updates, { updatedAt: new Date().toISOString() });
    this.save();
    return row;
  },

  get(table, id) {
    Guards.dataRead();

    const t = this.tables[table];
    if (!t) return null;
    return t.rows.find(r => r.id === id) || null;
  },

  find(table, filterFn = () => true) {
    Guards.dataRead();

    const t = this.tables[table];
    if (!t) return [];
    return t.rows.filter(filterFn);
  },

  delete(table, id) {
    Guards.dataWrite();

    const t = this.tables[table];
    if (!t) return;
    t.rows = t.rows.filter(r => r.id !== id);
    this.save();
  }
};
