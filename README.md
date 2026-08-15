# NeoOS Source Registry

Shared governed external-data infrastructure for NeoOS products.

This repository owns provider governance, capability definitions, safe registry inspection, and the provider-independent Neo Data Gateway contract. Product repositories such as NeoContent and NeoCRM are consumers, not owners.

## Operating rule

Projects request a capability, not a vendor. Approved providers are production-eligible; experimental providers remain fail-closed unless explicitly enabled after review; blocked providers are never selectable.

## Boundary

The registry is independent of NeoContent. Product-specific research, writing, CRM, wealth, or UI logic must not live here.

The original live implementation remains temporarily vendored in NeoContent while consumer migration is performed without disrupting production. This repository becomes the canonical governance source after parity verification.
