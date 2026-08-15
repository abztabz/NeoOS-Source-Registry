import { boundedQuery, fetchProviderJson, httpsUrl, type ProviderFetcher } from "../http.js";
import type { SourceProvider } from "../registry.js";

export function dataciteAdapter(fetcher: ProviderFetcher = fetch) {
  return async (input: Record<string, unknown>, provider: SourceProvider) => {
    const query=boundedQuery(input.query); if(query.length<3) throw new Error("DataCite query is too short"); const limit=Math.min(Math.max(Number(input.limit??8)||8,1),10);
    const url=new URL("/dois",provider.baseUrl); url.searchParams.set("query",query); url.searchParams.set("page[size]",String(limit));
    const payload=await fetchProviderJson(url,{fetcher,allowedOrigin:new URL(provider.baseUrl).origin}); const items=Array.isArray(payload.data)?payload.data:[];
    const data=items.flatMap((item)=>{if(!item||typeof item!=="object"||Array.isArray(item))return[];const row=item as Record<string,unknown>;const attrs=row.attributes&&typeof row.attributes==="object"&&!Array.isArray(row.attributes)?row.attributes as Record<string,unknown>:{};const titles=Array.isArray(attrs.titles)?attrs.titles:[];const first=titles[0]&&typeof titles[0]==="object"&&!Array.isArray(titles[0])?titles[0] as Record<string,unknown>:{};const title=boundedQuery(first.title,500);const doi=boundedQuery(attrs.doi??row.id,200);const url=httpsUrl(attrs.url)||httpsUrl(doi?`https://doi.org/${doi}`:"");if(!title||!doi)return[];return[{kind:"scholarly",title,url,doi,verificationStatus:"discovery_only"}];});
    return {data,sourceObservedAt:new Date().toISOString()};
  };
}
