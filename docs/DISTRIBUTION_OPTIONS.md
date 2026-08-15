# Distribution options

The standalone registry can be consumed either as a pinned versioned package or as a separately deployed gateway service.

A package keeps no-key adapters close to each consumer and avoids an extra network hop, but every consumer deployment carries provider execution code and credentials. A central service gives one runtime, one credential boundary and immediate provider failover changes, but adds service availability, authentication and hosting concerns.

Do not choose solely for convenience. The current compatibility copy allows this decision to be made without risking NeoContent production.
