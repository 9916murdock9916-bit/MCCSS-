// core/data.js

import { DocumentStore } from "./data/document-store.js";
import { TableStore } from "./data/table-store.js";
import { DataExport } from "./data/export.js";
import { DataImport } from "./data/import.js";

export const Data = {
  documents: DocumentStore,
  tables: TableStore,
  export: DataExport,
  import: DataImport,

  init() {
    DocumentStore.init();
    TableStore.init();
  }
};

Data.init();