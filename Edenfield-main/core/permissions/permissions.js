// core/permissions.js

import { Roles } from "./permissions/roles.js";
import { Capabilities } from "./permissions/capabilities.js";
import { Enforcement } from "./permissions/enforce.js";
import { PermissionContext } from "./permissions/context.js";
import { Guards } from "./permissions/guards.js";

export const Permissions = {
  roles: Roles,
  capabilities: Capabilities,
  enforce: Enforcement,
  context: PermissionContext,
  guards: Guards,

  init() {
    Roles.init();
    Capabilities.init();
  }
};