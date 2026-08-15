import type { SourceProvider } from "./registry.js";
import { providersFor } from "./registry.js";
import { assessProviderHealth,type ProviderHealthObservation } from "./health.js";
import { sourceTrustScore } from "./trust.js";

export interface RouteRequirements { includeExperimental?:boolean; requireLiveAdapter?:boolean; region?:string; minimumTrust?:number; }
export interface RoutedProvider { provider:SourceProvider; trust:number; health:number; routeScore:number; healthState:string; }

export function routeProviders(capability:string,requirements:RouteRequirements={},health:Record<string,ProviderHealthObservation|undefined>={}):RoutedProvider[]{
  return providersFor(capability,{includeExperimental:requirements.includeExperimental}).filter(provider=>!requirements.requireLiveAdapter||provider.adapterStatus==="live"||provider.adapterStatus==="implemented").filter(provider=>!requirements.region||provider.regionCoverage.includes("global")||provider.regionCoverage.includes(requirements.region)).map(provider=>{const trust=sourceTrustScore(provider);const assessed=assessProviderHealth(health[provider.id]);const healthWeight=assessed.state==="unknown"?0:assessed.score*0.15;const routeScore=trust.score+healthWeight-provider.priority*0.05;return{provider,trust:trust.score,health:assessed.score,routeScore,healthState:assessed.state};}).filter(candidate=>candidate.trust>=(requirements.minimumTrust??0)&&candidate.healthState!=="quarantined").sort((a,b)=>b.routeScore-a.routeScore||a.provider.priority-b.provider.priority);
}
