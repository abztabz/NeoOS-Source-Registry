# Automatic registry-first use

For NeoOS engineering, external public-data dependencies default to registry-first sourcing.

When a project needs external data:

1. identify the required capability;
2. check this registry before researching or hard-coding a vendor;
3. use an approved provider/adapter where available;
4. preserve fallback, provenance, freshness and data-boundary metadata;
5. if only experimental providers exist, keep production fail-closed until governance review is complete;
6. if the capability is a gap, research and govern providers here before changing the consuming product.

This is a development architecture rule, not permission to transmit sensitive, private or customer-owned information to external providers. Privacy and product-specific data-minimization rules always take precedence.
