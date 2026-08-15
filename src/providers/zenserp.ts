import { boundedQuery, fetchProviderJson, httpsUrl, type ProviderFetcher } from "../http.js";
import type { SourceProvider } from "../registry.js";

export function zenserpAdapter(apiKey: string, fetcher: ProviderFetcher = fetch) {
  return async (input: Record<string, unknown>, provider: SourceProvider) => {
    if (provider.status !== "experimental") throw new Error("Zenserp must remain experimental until promoted");
    const query=boundedQuery(input.query); if(query.length<2) throw new Error("SERP query is too short");
    const url=new URL("/api/v2/search",provider.baseUrl); url.searchParams.set("q",query);
    const payload=await fetchProviderJson(url,{fetcher,allowedOrigin:new URL(provider.baseUrl).origin,headers:{apikey:apiKey}}); const organic=Array.isArray(payload.organic)?payload.organic:[];
    const data=organic.slice(0,8).flatMap((item,index)=>{if(!item||typeof item!=="object"||Array.isArray(item))return[];const row=item as Record<string,unknown>;const title=boundedQuery(row.title,300);const link=httpsUrl(row.url);if(!title||!link)return[];return[{position:Number(row.position)||index+1,title,url:link,domain:new URL(link).hostname,verificationStatus:"discovery_only"}];});
    return {data,sourceObservedAt:new Date().toISOString()};
  };
}
