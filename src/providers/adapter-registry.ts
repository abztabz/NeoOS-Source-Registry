import type { GatewayAdapter, GatewayProvider } from "../gateway.js";
import type { SourceProvider } from "../registry.js";
import { crossrefAdapter } from "./crossref.js";
import { dataciteAdapter } from "./datacite.js";
import { gdeltAdapter } from "./gdelt.js";
import { serpApiAdapter } from "./serpapi.js";
import { zenserpAdapter } from "./zenserp.js";

function adaptSourceProvider(adapter: (input: Record<string,unknown>, provider: SourceProvider) => Promise<{data:unknown;sourceObservedAt?:string|null}>): GatewayAdapter {
  return (input:Record<string,unknown>, provider:GatewayProvider) => adapter(input, provider as SourceProvider);
}

export function createDefaultAdapters(env: Record<string,string|undefined> = process.env): Record<string,GatewayAdapter> {
  const adapters:Record<string,GatewayAdapter>={"gdelt-doc":adaptSourceProvider(gdeltAdapter()),crossref:adaptSourceProvider(crossrefAdapter()),datacite:adaptSourceProvider(dataciteAdapter())};
  if(env.NEO_SERPAPI_KEY) adapters.serpapi=adaptSourceProvider(serpApiAdapter(env.NEO_SERPAPI_KEY));
  if(env.NEO_ZENSERP_KEY) adapters.zenserp=adaptSourceProvider(zenserpAdapter(env.NEO_ZENSERP_KEY));
  return adapters;
}
