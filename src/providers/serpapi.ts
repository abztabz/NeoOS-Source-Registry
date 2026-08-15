import { boundedQuery, fetchProviderJson, httpsUrl, type ProviderFetcher } from "../http.js";
import type { SourceProvider } from "../registry.js";

export function serpApiAdapter(apiKey: string, fetcher: ProviderFetcher = fetch) {
  return async (input: Record<string, unknown>, provider: SourceProvider) => {
    if (provider.status !== "experimental") throw new Error("SerpApi must remain experimental until promoted");
    const query=boundedQuery(input.query); if(query.length<2) throw new Error("SERP query is too short");
    const url=new URL("/search",provider.baseUrl); url.searchParams.set("engine","google"); url.searchParams.set("q",query); url.searchParams.set("api_key",apiKey);
    const payload=await fetchProviderJson(url,{fetcher,allowedOrigin:new URL(provider.baseUrl).origin}); const organic=Array.isArray(payload.organic_results)?payload.organic_results:[];
    const data=organic.slice(0,8).flatMap((item,index)=>{if(!item||typeof item!=="object"||Array.isArray(item))return[];const row=item as Record<string,unknown>;const title=boundedQuery(row.title,300);const link=httpsUrl(row.link);if(!title||!link)return[];return[{position:Number(row.position)||index+1,title,url:link,domain:new URL(link).hostname,verificationStatus:"discovery_only"}];});
    return {data,sourceObservedAt:new Date().toISOString()};
  };
}
