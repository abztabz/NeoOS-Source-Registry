# NeoOS Source Registry 2

Registry 2 evolves the source catalogue into an explainable intelligence control plane while remaining platform-agnostic.

## Decision pipeline

Capability request -> governance eligibility -> trust score -> health assessment -> requirement filtering -> intelligent routing -> provider fallback -> verification policy -> normalized result with provenance/confidence.

## Trust Engine

Trust is deterministic and explainable. It scores source authority, commercial rights, production access, adapter maturity, freshness policy and coverage. Blocked/retired sources score zero regardless of other attributes. Trust does not replace Aegis governance; it ranks already eligible sources.

## Health Engine

Runtime observations classify providers as healthy, degraded, unreliable, quarantined or unknown. Schema failure, authentication failure, quota exhaustion, staleness, availability and latency reduce health. Quarantined sources are excluded from intelligent routing.

## Verification Engine

Capabilities can require a single authoritative source, independent confirmation, or multi-source consensus. Numeric sources can define discrepancy tolerances. Conflicts are surfaced rather than silently averaged away.

## Source Scout

Discovery is separated from approval. New candidates enter as `discovered`, must pass `reviewing`, and only then may become `experimental`. Scout can never promote a candidate directly to approved production use.

## Platform rule

No WordPress, CMS, frontend, CRM, mobile, or product-specific assumptions belong in this layer. Those systems consume capabilities through adapters at their own product boundary.
