# Security model

The registry is not a secret store. It records only secret environment-variable names. Provider credentials are supplied by server environments and never returned by safe registry snapshots.

Provider HTTP adapters enforce HTTPS and approved origins, bound query input, reject redirects, limit response size and use request timeouts. Products must minimize outbound data and must not route confidential or personal data through public-data capabilities.

Blocked providers are structurally excluded from gateway selection. Experimental providers require explicit opt-in and remain subject to product-level production gates.
