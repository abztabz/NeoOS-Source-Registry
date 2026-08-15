import { boundedQuery, fetchProviderJson, type ProviderFetcher } from "../http.js";
import type { SourceProvider } from "../registry.js";

export function worldBankAdapter(fetcher: ProviderFetcher = fetch) {
  return async (input: Record<string, unknown>, provider: SourceProvider) => {
    const country = boundedQuery(input.country ?? "all", 40).replace(/[^a-zA-Z0-9;-]/g, "");
    const indicator = boundedQuery(input.indicator, 80).replace(/[^a-zA-Z0-9._;-]/g, "");
    if (!indicator) throw new Error("World Bank indicator is required");
    const limit = Math.min(Math.max(Number(input.limit ?? 10) || 10, 1), 50);
    const url = new URL(`/v2/country/${country || "all"}/indicator/${indicator}`, provider.baseUrl);
    url.searchParams.set("format", "json");
    url.searchParams.set("per_page", String(limit));
    if (input.date) url.searchParams.set("date", boundedQuery(input.date, 30));
    if (input.mrv) url.searchParams.set("mrv", String(Math.min(Math.max(Number(input.mrv) || 1, 1), 20)));
    const payload = await fetchProviderJson(url, { fetcher, allowedOrigin: new URL(provider.baseUrl).origin });
    const rows = Array.isArray(payload) && Array.isArray(payload[1]) ? payload[1] : [];
    const data = rows.flatMap((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return [];
      const row = item as Record<string, unknown>;
      const countryObj = row.country && typeof row.country === "object" && !Array.isArray(row.country) ? row.country as Record<string, unknown> : {};
      const indicatorObj = row.indicator && typeof row.indicator === "object" && !Array.isArray(row.indicator) ? row.indicator as Record<string, unknown> : {};
      return [{ kind: "economic-indicator", country: boundedQuery(countryObj.value, 120), countryCode: boundedQuery(row.countryiso3code, 8), indicator: boundedQuery(indicatorObj.value, 200), indicatorCode: boundedQuery(row.indicator && (indicatorObj.id ?? indicator), 80), period: boundedQuery(row.date, 30), value: typeof row.value === "number" ? row.value : row.value ?? null, unit: boundedQuery(row.unit, 80), obsStatus: boundedQuery(row.obs_status, 40), verificationStatus: "official-source" }];
    });
    return { data, sourceObservedAt: new Date().toISOString() };
  };
}
