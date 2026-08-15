import { boundedQuery, fetchProviderJson, type ProviderFetcher } from "../http.js";
import type { SourceProvider } from "../registry.js";

export function ecbFxAdapter(fetcher: ProviderFetcher = fetch) {
  return async (input: Record<string, unknown>, provider: SourceProvider) => {
    const currency = boundedQuery(input.currency, 3).toUpperCase();
    if (!/^[A-Z]{3}$/.test(currency)) throw new Error("ECB currency must be a 3-letter code");
    const frequency = boundedQuery(input.frequency ?? "D", 1).toUpperCase();
    if (!new Set(["D","M","Q","A"]).has(frequency)) throw new Error("Unsupported ECB frequency");
    const key = `${frequency}.${currency}.EUR.SP00.A`;
    const url = new URL(`/service/data/EXR/${key}`, provider.baseUrl);
    url.searchParams.set("format", "jsondata");
    url.searchParams.set("detail", "dataonly");
    url.searchParams.set("lastNObservations", String(Math.min(Math.max(Number(input.limit ?? 2)||2,1),20)));
    const payload = await fetchProviderJson(url, { fetcher, allowedOrigin:new URL(provider.baseUrl).origin, headers:{accept:"application/vnd.sdmx.data+json;version=1.0.0-wd"} });
    return { data:[{kind:"fx-reference-series",currency,baseCurrency:"EUR",frequency,seriesKey:key,sdmx:payload,verificationStatus:"official-source"}], sourceObservedAt:new Date().toISOString() };
  };
}
