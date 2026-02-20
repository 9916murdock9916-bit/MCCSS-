// core/data/import.js

import { DocumentStore } from "./document-store.js";
import { TableStore } from "./table-store.js";
import { Guards } from "../permissions/guards.js";

export const DataImport = {
  load(payload) {
    Guards.dataAll();

    if (payload.documents) {
      DocumentStore.collections = payload.documents;
      DocumentStore.save();
    }

    if (payload.tables) {
      TableStore.tables = payload.tables;
      TableStore.save();
    }

    return true;
  }
};
