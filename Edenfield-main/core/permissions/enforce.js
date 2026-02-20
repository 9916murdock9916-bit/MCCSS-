// core/permissions/enforce.js

import { Roles } from "./roles.js";
import { PermissionContext } from "./context.js";
import { Capabilities } from "./capabilities.js";

export const Enforcement = {
  check(capability) {
    const ctx = PermissionContext.current;

    // Substrate sovereignty: system role overrides everything
    if (ctx.role === "system") return true;

    if (!Capabilities.exists(capability)) return false;

    const role = Roles.get(ctx.role);
    if (!role) return false;

    if (role.capabilities.includes(capability)) return true;

    if (ctx.dynamicCaps.includes(capability)) return true;

    return false;
  },

  require(capability) {
    if (!this.check(capability)) {
      throw new Error(`Permission denied: missing capability ${capability}`);
    }
  }
};
