import { boundedQuery, fetchProviderJson, type ProviderFetcher } from "../http.js";
import type { SourceProvider } from "../registry.js";

export function secEdgarAdapter(userAgent: string, fetcher: ProviderFetcher = fetch) {
  return async (input: Record<string, unknown>, provider: SourceProvider) => {
    const digits = boundedQuery(input.cik, 20).replace(/\D/g, "");
    if (!digits || digits.length > 10) throw new Error("SEC CIK is required");
    if (!userAgent.trim()) throw new Error("SEC identifying User-Agent is required");
    const cik = digits.padStart(10, "0");
    const url = new URL(`/api/xbrl/companyfacts/CIK${cik}.json`, provider.baseUrl);
    const payload = await fetchProviderJson(url, { fetcher, allowedOrigin: new URL(provider.baseUrl).origin, headers: { "User-Agent": userAgent, "Accept-Encoding": "gzip, deflate" } });
    const facts = payload.facts && typeof payload.facts === "object" && !Array.isArray(payload.facts) ? payload.facts as Record<string, unknown> : {};
    const namespaces = Object.entries(facts).flatMap(([namespace, raw]) => {
      if (!raw || typeof raw !== "object" || Array.isArray(raw)) return [];
      const entries = raw as Record<string, unknown>;
      return Object.entries(entries).slice(0, 500).flatMap(([concept, value]) => {
        if (!value || typeof value !== "object" || Array.isArray(value)) return [];
        const fact = value as Record<string, unknown>;
        return [{ namespace, concept, label: boundedQuery(fact.label, 200), description: boundedQuery(fact.description, 500), units: fact.units ?? {}, verificationStatus: "official-source" }];
      });
    });
    return { data: { cik, entityName: boundedQuery(payload.entityName, 240), facts: namespaces }, sourceObservedAt: new Date().toISOString() };
  };
}
