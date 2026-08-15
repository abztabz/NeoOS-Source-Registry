export type ProviderHealthState="healthy"|"degraded"|"unreliable"|"quarantined"|"unknown";

export interface ProviderHealthObservation { providerId:string; checkedAt:string; successRate:number; latencyMs:number; stale:boolean; schemaValid:boolean; authValid:boolean; quotaAvailable:boolean; }
export interface ProviderHealthAssessment { state:ProviderHealthState; score:number; reasons:string[]; }

export function assessProviderHealth(observation?:ProviderHealthObservation):ProviderHealthAssessment {
  if(!observation) return {state:"unknown",score:50,reasons:["No runtime health observation is available."]};
  const reasons:string[]=[]; let score=100;
  if(observation.successRate<0.95){score-=25;reasons.push("Success rate is below 95%.");}
  if(observation.successRate<0.75){score-=30;reasons.push("Success rate is below 75%.");}
  if(observation.latencyMs>3000){score-=10;reasons.push("Latency exceeds 3 seconds.");}
  if(observation.stale){score-=20;reasons.push("Observed data is stale.");}
  if(!observation.schemaValid){score-=35;reasons.push("Response schema validation failed.");}
  if(!observation.authValid){score-=50;reasons.push("Authentication is failing.");}
  if(!observation.quotaAvailable){score-=30;reasons.push("Provider quota is unavailable.");}
  score=Math.max(0,score);
  const state:ProviderHealthState=score>=85?"healthy":score>=65?"degraded":score>=40?"unreliable":"quarantined";
  return {state,score,reasons:reasons.length?reasons:["Provider health signals are within policy."]};
}
