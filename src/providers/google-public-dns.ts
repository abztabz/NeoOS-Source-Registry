import { boundedQuery, fetchProviderJson, type ProviderFetcher } from "../http.js";
import type { SourceProvider } from "../registry.js";

const recordTypes = new Set(["A","AAAA","CNAME","MX","NS","SOA","TXT","CAA","PTR"]);

export function googlePublicDnsAdapter(fetcher: ProviderFetcher = fetch) {
  return async (input: Record<string, unknown>, provider: SourceProvider) => {
    const name = boundedQuery(input.name, 253).toLowerCase();
    if (!name || !/^(?=.{1,253}\.?$)(?:[a-z0-9_](?:[a-z0-9_-]{0,61}[a-z0-9_])?\.)*[a-z0-9_](?:[a-z0-9_-]{0,61}[a-z0-9_])?\.?$/i.test(name)) throw new Error("Valid public DNS name is required");
    const requestedType = boundedQuery(input.type ?? "A", 10).toUpperCase();
    if (!recordTypes.has(requestedType)) throw new Error("DNS record type is not permitted by this adapter");
    const url = new URL("/resolve", provider.baseUrl);
    url.searchParams.set("name", name);
    url.searchParams.set("type", requestedType);
    url.searchParams.set("cd", "false");
    url.searchParams.set("do", "true");
    url.searchParams.set("edns_client_subnet", "0.0.0.0/0");
    const payload = await fetchProviderJson(url, { fetcher, allowedOrigin: new URL(provider.baseUrl).origin });
    const answers = Array.isArray(payload.Answer) ? payload.Answer : [];
    const data = answers.flatMap((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return [];
      const row = item as Record<string, unknown>;
      return [{ kind:"dns-record", name:boundedQuery(row.name,253), type:Number(row.type ?? 0), ttl:Number(row.TTL ?? 0), data:boundedQuery(row.data,1000), dnssecAuthenticated:Boolean(payload.AD), responseStatus:Number(payload.Status ?? -1), verificationStatus:"official-resolver" }];
    });
    return { data, sourceObservedAt:new Date().toISOString() };
  };
}
