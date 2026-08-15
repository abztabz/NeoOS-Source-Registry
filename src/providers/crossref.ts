import { boundedQuery, fetchProviderJson, httpsUrl, type ProviderFetcher } from "../http.js";
import type { SourceProvider } from "../registry.js";

export function crossrefAdapter(fetcher: ProviderFetcher = fetch) {
  return async (input: Record<string, unknown>, provider: SourceProvider) => {
    const query = boundedQuery(input.query); if (query.length < 3) throw new Error("Crossref query is too short");
    const limit = Math.min(Math.max(Number(input.limit ?? 8) || 8, 1), 10);
    const url = new URL("/works", provider.baseUrl); url.searchParams.set("query.bibliographic", query); url.searchParams.set("rows", String(limit));
    const payload = await fetchProviderJson(url, { fetcher, allowedOrigin: new URL(provider.baseUrl).origin });
    const message = payload.message && typeof payload.message === "object" && !Array.isArray(payload.message) ? payload.message as Record<string,unknown> : {};
    const items = Array.isArray(message.items) ? message.items : [];
    const data = items.flatMap((item) => { if (!item || typeof item !== "object" || Array.isArray(item)) return []; const work=item as Record<string,unknown>; const title=boundedQuery(Array.isArray(work.title)?work.title[0]:work.title,500); const doi=boundedQuery(work.DOI,200); const url=httpsUrl(work.URL); if(!title||(!doi&&!url)) return []; return [{kind:"scholarly",title,url,doi,verificationStatus:"discovery_only"}]; });
    return { data, sourceObservedAt: new Date().toISOString() };
  };
}
