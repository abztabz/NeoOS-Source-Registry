import type { SourceProvider } from "./registry.js";

export interface SourceTrustScore {
  score: number;
  band: "preferred" | "strong" | "usable" | "restricted" | "blocked";
  factors: { authority:number; rights:number; access:number; maturity:number; freshness:number; coverage:number };
  reasons: string[];
}

const authority={official:25,primary:23,aggregator:16,community:12} as const;
const rights={approved:25,review_required:10,blocked:0} as const;
const access={production_allowed:15,not_applicable:15,unknown:7,evaluation_only:4,not_available:0} as const;
const maturity={live:15,implemented:13,planned:7,not_applicable:0} as const;

export function sourceTrustScore(provider:SourceProvider):SourceTrustScore {
  if(provider.status==="blocked"||provider.status==="retired"||provider.commercialUse==="blocked") return {score:0,band:"blocked",factors:{authority:authority[provider.sourceQuality],rights:0,access:0,maturity:0,freshness:0,coverage:0},reasons:["Provider is not eligible for routing."]};
  const factors={authority:authority[provider.sourceQuality],rights:rights[provider.commercialUse],access:access[provider.freeTierUse],maturity:maturity[provider.adapterStatus],freshness:provider.freshnessPolicy?10:0,coverage:provider.regionCoverage.length?10:0};
  const score=Math.min(100,Object.values(factors).reduce((sum,value)=>sum+value,0));
  const band=score>=90?"preferred":score>=75?"strong":score>=55?"usable":"restricted";
  const reasons=[`${provider.sourceQuality} source`,`commercial rights: ${provider.commercialUse}`,`access: ${provider.freeTierUse}`,`adapter: ${provider.adapterStatus}`];
  return {score,band,factors,reasons};
}
