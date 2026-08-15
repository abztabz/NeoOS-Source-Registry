import { boundedQuery, fetchProviderJson, httpsUrl, type ProviderFetcher } from "../http.js";
import type { SourceProvider } from "../registry.js";

export function gdeltAdapter(fetcher: ProviderFetcher = fetch) {
  return async (input: Record<string, unknown>, provider: SourceProvider) => {
    const query = boundedQuery(input.query);
    if (query.length < 3) throw new Error("GDELT query is too short");
    const days = Math.min(Math.max(Number(input.days ?? 7) || 7, 1), 30);
    const limit = Math.min(Math.max(Number(input.limit ?? 8) || 8, 1), 10);
    const url = new URL("/api/v2/doc/doc", provider.baseUrl);
    url.searchParams.set("query", query); url.searchParams.set("mode", "artlist"); url.searchParams.set("maxrecords", String(limit)); url.searchParams.set("timespan", `${days}d`); url.searchParams.set("sort", "HybridRel"); url.searchParams.set("format", "json");
    const payload = await fetchProviderJson(url, { fetcher, allowedOrigin: new URL(provider.baseUrl).origin });
    const articles = Array.isArray(payload.articles) ? payload.articles : [];
    const data = articles.slice(0, limit).flatMap((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return [];
      const article = item as Record<string, unknown>; const articleUrl = httpsUrl(article.url); const title = boundedQuery(article.title, 500);
      if (!articleUrl || !title) return [];
      return [{ kind:"news", title, url:articleUrl, publisher:boundedQuery(article.domain,200), publishedAt:String(article.seendate ?? "") || null, verificationStatus:"discovery_only" }];
    });
    return { data, sourceObservedAt: new Date().toISOString() };
  };
}
