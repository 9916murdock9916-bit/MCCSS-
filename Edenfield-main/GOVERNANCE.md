# Governance and licensing overview

Principles

- Least privilege: access is always scoped by roles and, where appropriate, by organism leases.
- Auditability: governance actions are recorded in an append-only `audit.log`.
- Delegated control: agencies or tenants own their data and may lease organisms to operators.

Operational controls

- `core/leases.js` manages lease issuance and revocation; events are logged via `core/audit.js`.
- `core/permissions/*` enforces role and capability checks with organism-scoped guard options.

Licensing model

- Default repository includes an open-source `LICENSE` (MIT). For government production deployments we recommend a dual-licensing approach: maintain the source under MIT for research/interop while offering a commercial support/licensing contract for hardened, supported builds, SLAs, and compliance validation.

Commercial offer items

- Hardened build and packaging for air-gapped environments
- Compliance artifacts and evidence packages (FedRAMP documentation)
- SLA-backed support, security patching, and incident response

Acceptance & compliance

- Keep an instrumented audit log and deliver regular compliance reports as part of commercial engagements.
