# Live Provider Health Monitoring

NeoOS records provider health from real gateway traffic and feeds that state back into provider selection.

## Signals

Each attempted provider call records only bounded operational metadata: provider id, observation time, outcome, duration, failure class, and an optional stale flag. Raw provider errors, queries, customer data, credentials, and response bodies are not retained by the health monitor.

The rolling observation derives technical success rate, usable-response rate, latency, recent schema/auth/quota health, consecutive failures, and consecutive successes.

## States

`unknown -> healthy -> degraded -> unreliable -> quarantined`

A provider with three consecutive technical failures is treated as a hard health failure. Authentication, quota, and schema failures are also hard signals and do not wait for the normal minimum sample count.

Consumer routing excludes quarantined providers. Degraded and unreliable providers remain eligible but are demoted behind healthier alternatives.

## Recovery

Recovery is intentionally slower than degradation. A quarantined provider needs consecutive successful observations before moving to `unreliable`, and subsequent healthy observations can improve it by at most one state at a time. This hysteresis reduces route flapping.

## Runtime scope

`createNeoDataGateway()` shares one health monitor across gateway instances in the same warm Node.js process. This provides immediate passive health feedback without an external dependency.

This is not yet cross-instance durable monitoring. Persistent multi-instance history and scheduled active probes belong in the independent Neo Data Gateway runtime so they can be added without coupling the registry to a paid persistence product or a specific deployment platform.
