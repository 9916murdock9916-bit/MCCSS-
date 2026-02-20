// core/permissions/enforce.js

import { Roles } from "./roles.js";
import { PermissionContext } from "./context.js";
import { Capabilities } from "./capabilities.js";
import { LeaseManager } from "../leases.js";

export const Enforcement = {
  async check(capability, opts = {}) {
    const ctx = PermissionContext.current;

    // system role overrides everything
    if (ctx.role === "system") return true;

    if (!Capabilities.exists(capability)) return false;

    const role = Roles.get(ctx.role);
    if (!role) return false;

    if (role.capabilities.includes(capability)) {
      // if capability relates to data and an organism is specified, verify scope
      if (opts.organism) {
        // direct organism match
        if (ctx.organism === opts.organism) return true;

        // lease-based admin: subjectId can be owner of the organism
        if (ctx.subjectId && (await LeaseManager.init(), LeaseManager.isOwnerOf(ctx.subjectId, opts.organism))) return true;

        return false;
      }

      return true;
    }

    if (ctx.dynamicCaps.includes(capability)) return true;

    return false;
  },

  async require(capability, opts = {}) {
    if (!(await this.check(capability, opts))) {
      throw new Error(`Permission denied: missing capability ${capability}`);
    }
  }
};
