# Failure model

Gateway provider failure is expected. Within a capability, eligible providers are tried in priority order; an exception or empty result records a privacy-safe attempt and moves to the next eligible adapter. A successful result includes prior attempts and provenance. If no eligible provider returns usable data, the gateway returns a bounded failure rather than silently selecting an experimental or blocked source.
