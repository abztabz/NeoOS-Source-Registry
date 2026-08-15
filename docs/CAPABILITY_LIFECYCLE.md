# Capability lifecycle

A product need is mapped to a capability before a provider is chosen.

`ready` means at least one approved production-eligible provider exists. `experimental` means governed candidates exist but none are approved for ordinary production. `gap` means the absence of an approved/candidate provider is explicit and intentional.

When a new project asks for outside data, resolve the capability here first. If ready, use the approved path. If experimental, review/promote before production. If gap, perform provider research and governance here before adding vendor-specific product code.
