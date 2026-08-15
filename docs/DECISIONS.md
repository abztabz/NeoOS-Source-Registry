# Architectural decisions

1. NeoOS Source Registry is shared infrastructure, not a NeoContent subsystem.
2. Products consume capabilities rather than provider names.
3. Registry completeness and adapter completeness are separate.
4. Experimental providers fail closed.
5. Provider governance is centralized; products may be stricter but cannot locally promote a source.
6. Extraction from NeoContent is staged to preserve production continuity.
7. The standalone repository is canonical; NeoContent's local runtime is a temporary compatibility copy until shared distribution is verified.
8. External-data needs in future NeoOS projects default to registry-first resolution without requiring a separate user prompt to search the registry.
