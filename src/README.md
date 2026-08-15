# Runtime modules

`registry.ts` owns provider governance. `capabilities.ts` owns capability readiness. `gateway.ts` performs approved-provider selection, sequential fallback and provenance. `consumer-policy.ts` is the registry-first decision layer for consumers. `registry-view.ts` exposes safe governance metadata. `providers/` contains normalized adapters.

Product-specific behavior must not be added here.
