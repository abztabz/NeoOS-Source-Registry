import type { GatewayAdapter, GatewayProvider } from "../gateway.js";
import type { SourceProvider } from "../registry.js";
import { companiesHouseAdapter } from "./companies-house.js";
import { crossrefAdapter } from "./crossref.js";
import { dataciteAdapter } from "./datacite.js";
import { ecbFxAdapter } from "./ecb.js";
import { gdeltAdapter } from "./gdelt.js";
import { googlePublicDnsAdapter } from "./google-public-dns.js";
import { metNorwayAdapter } from "./met-norway.js";
import { secEdgarAdapter } from "./sec-edgar.js";
import { serpApiAdapter } from "./serpapi.js";
import { worldBankAdapter } from "./world-bank.js";
import { zenserpAdapter } from "./zenserp.js";

function adaptSourceProvider(adapter: (input: Record<string,unknown>, provider: SourceProvider) => Promise<{data:unknown;sourceObservedAt?:string|null}>): GatewayAdapter {
  return (input:Record<string,unknown>, provider:GatewayProvider) => adapter(input, provider as SourceProvider);
}

export function createDefaultAdapters(env: Record<string,string|undefined> = process.env): Record<string,GatewayAdapter> {
  const adapters:Record<string,GatewayAdapter>={"gdelt-doc":adaptSourceProvider(gdeltAdapter()),crossref:adaptSourceProvider(crossrefAdapter()),datacite:adaptSourceProvider(dataciteAdapter()),"world-bank-indicators":adaptSourceProvider(worldBankAdapter()),"ecb-data-portal":adaptSourceProvider(ecbFxAdapter()),"google-public-dns":adaptSourceProvider(googlePublicDnsAdapter())};
  if(env.NEO_SEC_USER_AGENT) adapters["sec-edgar"]=adaptSourceProvider(secEdgarAdapter(env.NEO_SEC_USER_AGENT));
  if(env.NEO_MET_USER_AGENT) adapters["met-norway-weather"]=adaptSourceProvider(metNorwayAdapter(env.NEO_MET_USER_AGENT));
  if(env.NEO_COMPANIES_HOUSE_KEY) adapters["companies-house"]=adaptSourceProvider(companiesHouseAdapter(env.NEO_COMPANIES_HOUSE_KEY));
  if(env.NEO_SERPAPI_KEY) adapters.serpapi=adaptSourceProvider(serpApiAdapter(env.NEO_SERPAPI_KEY));
  if(env.NEO_ZENSERP_KEY) adapters.zenserp=adaptSourceProvider(zenserpAdapter(env.NEO_ZENSERP_KEY));
  return adapters;
}
