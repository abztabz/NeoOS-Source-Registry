# Provider adapters

Adapters normalize provider-specific responses behind capability contracts. Adding an adapter does not by itself approve a provider. Eligibility is controlled by `src/registry.ts`.

Live extracted adapters: GDELT, Crossref, DataCite, SerpApi and Zenserp. SerpApi and Zenserp remain experimental and therefore fail closed unless a consumer explicitly enables experimental access under reviewed configuration.
