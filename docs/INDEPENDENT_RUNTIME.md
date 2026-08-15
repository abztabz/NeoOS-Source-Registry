# Neo Data Gateway independent runtime

The standalone NeoOS Source Registry repository is also the canonical runtime package for the shared Neo Data Gateway. Products are consumers; no product or delivery platform owns this service.

## Public endpoints

- `GET /healthz` — liveness and package/schema metadata only.
- `GET /v1/registry` — safe governance metadata. Optional `?capability=<id>` filter. Never exposes provider base URLs, credential bindings, keys, or customer data.

## Protected execution endpoint

- `POST /v1/query`
- Required headers:
  - `Authorization: Bearer <consumer-specific-token>`
  - `X-Neo-Consumer: <consumer-id>`
- Required JSON body:

```json
{
  "capability": "economic-data",
  "input": {
    "country": "AE",
    "indicator": "NY.GDP.MKTP.CD"
  }
}
```

`includeExperimental: true` is rejected unless `NEO_GATEWAY_ALLOW_EXPERIMENTAL=true` is set on the runtime as an explicit non-default governance decision.

## Authentication

`NEO_GATEWAY_CONSUMER_TOKENS` is a server-side JSON object mapping consumer ids to distinct bearer tokens. Each token must be at least 24 characters. Example values in documentation are placeholders only; real secrets must be generated and stored in the deployment environment.

The runtime fails closed when consumer authentication is missing or malformed. Consumer ids are bounded lowercase slugs. Tokens are compared using a constant-time comparison. Credentials are never returned in normalized responses.

## Runtime safety

- Provider execution is server-to-server only.
- Request bodies are bounded to 32 KiB.
- Capability ids must exist in the canonical registry.
- Input must be a bounded JSON object.
- Provider adapters remain governed by registry status and runtime configuration.
- Query results preserve provider provenance and current provider-health assessment.
- Health feedback remains memory-local per warm serverless instance until durable cross-instance storage is intentionally introduced.
- The runtime does not log request bodies, provider response bodies, credentials, or raw provider errors.

## Deployment ownership

Deploy this repository as its own Vercel project (recommended project slug: `neoos-source-registry`). Do not deploy it inside NeoContent, NeoCRM, Wealth, or another Neo product project.

A product migration should be staged:

1. Deploy and verify `/healthz` and `/v1/registry`.
2. Configure one consumer token for the first product.
3. Verify protected `/v1/query` against an approved no-key capability.
4. Add approved provider credentials only as required.
5. Point the consumer to the independent gateway while retaining its existing compatibility path temporarily.
6. Remove the compatibility copy only after production verification.

This sequence keeps the Registry as shared NeoOS infrastructure and prevents a consumer cutover from becoming a service-availability event.
