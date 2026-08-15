# Next infrastructure step

After CI validates this extraction, distribution should be versioned rather than copied manually. Preferred choices are a private/public package consumed at a pinned version or an independently deployed gateway service with a versioned API. The choice depends on whether consumers need in-process adapters or centralized runtime execution.

Until that decision is implemented and production-tested, the NeoContent compatibility copy stays in place.
