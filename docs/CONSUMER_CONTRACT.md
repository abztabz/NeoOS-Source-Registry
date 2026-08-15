# Consumer Contract

NeoOS products integrate by capability rather than provider name.

A consumer request consists of a capability identifier, bounded public input, and optional explicitly governed experimental-provider permission. A successful gateway response identifies the capability, selected provider, observation timestamp, source observation timestamp where available, duration, provenance, normalized data, and failed/empty fallback attempts.

Consumers must not infer that discovery metadata is factual evidence or that linked content is licensed for reuse. Each provider's data boundary remains authoritative.

## Current capability classes

Ready capabilities include news discovery, scholarly discovery, company filings, company registry, economic data, FX rates, governed open data, government open-data discovery, weather forecast and DNS resolution.

Experimental capabilities include SERP intelligence, jobs discovery, securities market data, crypto market data, entertainment metadata and geocoding.

Explicit gaps include language translation and email validation until a provider passes governance review.

## Default integration policy

When a NeoOS project needs external public data, it should first map the need to an existing registry capability. If a ready provider has no adapter, implement the adapter here. If the capability is experimental, complete governance before production activation. If the capability is a gap, research providers here before adding product-specific API code.
