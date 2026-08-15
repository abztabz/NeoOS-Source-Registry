import { boundedQuery, fetchProviderJson, type ProviderFetcher } from "../http.js";
import type { SourceProvider } from "../registry.js";

export function companiesHouseAdapter(apiKey: string, fetcher: ProviderFetcher = fetch) {
  const key = boundedQuery(apiKey, 300);
  if (!key) throw new Error("Companies House API key is required");
  const authorization = `Basic ${Buffer.from(`${key}:`, "utf8").toString("base64")}`;
  return async (input: Record<string, unknown>, provider: SourceProvider) => {
    const query = boundedQuery(input.query, 160);
    if (query.length < 2) throw new Error("Companies House query is too short");
    const limit = Math.min(Math.max(Number(input.limit ?? 10) || 10, 1), 20);
    const url = new URL("/search/companies", provider.baseUrl);
    url.searchParams.set("q", query);
    url.searchParams.set("items_per_page", String(limit));
    const payload = await fetchProviderJson(url, { fetcher, allowedOrigin: new URL(provider.baseUrl).origin, headers: { authorization } });
    const items = Array.isArray(payload.items) ? payload.items : [];
    const data = items.flatMap((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return [];
      const row = item as Record<string, unknown>;
      const companyNumber = boundedQuery(row.company_number, 20);
      if (!companyNumber) return [];
      return [{ kind: "company-registry", companyNumber, title: boundedQuery(row.title, 240), companyStatus: boundedQuery(row.company_status, 80), companyType: boundedQuery(row.company_type, 100), dateOfCreation: boundedQuery(row.date_of_creation, 40), addressSnippet: boundedQuery(row.address_snippet, 300), verificationStatus: "official-source" }];
    });
    return { data, sourceObservedAt: new Date().toISOString() };
  };
}
