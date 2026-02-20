// core/permissions.js

import { Roles } from "./roles.js";
import { Capabilities } from "./capabilities.js";
import { Enforcement } from "./enforce.js";
import { PermissionContext } from "./context.js";
import { Guards } from "./guards.js";
import { LeaseManager } from "../leases.js";

export const Permissions = {
  roles: Roles,
  capabilities: Capabilities,
  enforce: Enforcement,
  context: PermissionContext,
  guards: Guards,

  init() {
    Roles.init();
    Capabilities.init();
    // load leases synchronously at startup so permission checks can be sync
    if (LeaseManager && LeaseManager.initSync) {
      try { LeaseManager.initSync(); } catch (e) { /* best-effort */ }
    }
  }
};