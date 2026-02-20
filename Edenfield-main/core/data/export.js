// core/data/export.js

import { DocumentStore } from "./document-store.js";
import { TableStore } from "./table-store.js";
import { Guards } from "../permissions/guards.js";

export const DataExport = {
  all() {
    Guards.dataAll();

    return {
      documents: DocumentStore.collections,
      tables: TableStore.tables,
      exportedAt: new Date().toISOString()
    };
  }
};
