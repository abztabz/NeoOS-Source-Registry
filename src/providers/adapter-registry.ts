import type { GatewayAdapter } from "../gateway.js";
import { crossrefAdapter } from "./crossref.js";
import { dataciteAdapter } from "./datacite.js";
import { gdeltAdapter } from "./gdelt.js";
import { serpApiAdapter } from "./serpapi.js";
import { zenserpAdapter } from "./zenserp.js";

export function createDefaultAdapters(env: Record<string,string|undefined> = process.env): Record<string,GatewayAdapter> {
  const adapters: Record<string,GatewayAdapter> = { "gdelt-doc":gdeltAdapter(), crossref:crossrefAdapter(), datacite:dataciteAdapter() };
  if(env.NEO_SERPAPI_KEY) adapters.serpapi=serpApiAdapter(env.NEO_SERPAPI_KEY);
  if(env.NEO_ZENSERP_KEY) adapters.zenserp=zenserpAdapter(env.NEO_ZENSERP_KEY);
  return adapters;
}
