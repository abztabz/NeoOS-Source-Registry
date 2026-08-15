# Provenance contract

Successful gateway responses identify the normalized capability, provider ID, observation time, provider/source observation time when available, request duration, provider name, required attribution, data boundary, normalized data and earlier empty/error fallback attempts.

Provider errors are not exposed as raw messages in the shared response. This avoids leaking provider internals or sensitive request context while retaining enough telemetry to diagnose fallback behavior.
