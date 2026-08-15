# Architecture

NeoOS Source Registry is the canonical control plane for external public-data sources used by NeoOS projects.

## Flow

Product -> capability request -> Source Registry governance -> Neo Data Gateway adapter -> approved provider -> normalized response with provenance.

## Rules

1. Products request capabilities, never hard-code vendor policy.
2. Approved providers are eligible by default.
3. Experimental providers are fail-closed and require explicit enablement after review.
4. Blocked providers are never selectable.
5. Credentials remain server-side and are not exposed by safe registry inspection.
6. Provider responses retain provenance, freshness information and data-boundary metadata.
7. A public API catalogue is discovery input, never an allowlist.
8. Sensitive or customer-owned data is not sent to an external provider merely because that provider exists in the registry.

## Consumer boundary

NeoContent, NeoCRM, NeoOS Wealth, Living Website and future projects are consumers. Product-specific interpretation belongs in those products. This repository owns only shared source governance and provider-independent data access.

## Migration safety

During extraction, NeoContent keeps its current vendored runtime until the standalone package/service reaches parity. Removal of the vendored copy is a separate cutover step after build and production verification. This avoids a big-bang migration.
