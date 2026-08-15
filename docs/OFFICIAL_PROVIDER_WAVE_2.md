# Official provider wave 2

This wave activates two already-approved official providers without expanding to unvetted sources.

- ECB Data Portal: bounded EXR reference-rate retrieval through the official SDMX service. The adapter accepts a three-letter currency, a controlled frequency and a bounded observation count. It requests explicit SDMX JSON and preserves the official payload for downstream normalization/version compatibility.
- Google Public DNS: bounded DNS-over-HTTPS JSON resolution for an allowlist of record types. The adapter requests DNSSEC data and explicitly sends an empty EDNS client subnet to avoid forwarding caller network location to authoritative servers.

Both providers remain governed by the registry. Adapter availability does not override lifecycle, commercial-use, privacy or production eligibility gates.
