export type VerificationMode="single-authoritative"|"independent-confirmation"|"consensus";
export interface VerificationPolicy { capability:string; mode:VerificationMode; minimumSources:number; discrepancyTolerance?:number; }
export interface NumericObservation { providerId:string; value:number; observedAt:string; }

export const verificationPolicies:readonly VerificationPolicy[]=Object.freeze([
  {capability:"company-filings",mode:"single-authoritative",minimumSources:1},
  {capability:"company-registry",mode:"single-authoritative",minimumSources:1},
  {capability:"economic-data",mode:"independent-confirmation",minimumSources:1},
  {capability:"fx-rates",mode:"independent-confirmation",minimumSources:2,discrepancyTolerance:0.01},
  {capability:"market-data",mode:"consensus",minimumSources:2,discrepancyTolerance:0.01},
  {capability:"crypto-market-data",mode:"consensus",minimumSources:2,discrepancyTolerance:0.02}
]);

export function verifyNumericObservations(policy:VerificationPolicy,observations:NumericObservation[]){
  if(observations.length<policy.minimumSources)return{verified:false,confidence:"insufficient" as const,reason:"Not enough independent observations."};
  if(policy.mode==="single-authoritative")return{verified:true,confidence:"high" as const,reason:"Authoritative source policy satisfied."};
  const values=observations.map(item=>item.value);const min=Math.min(...values);const max=Math.max(...values);const midpoint=(min+max)/2;const discrepancy=midpoint===0?Math.abs(max-min):Math.abs(max-min)/Math.abs(midpoint);const tolerance=policy.discrepancyTolerance??0.02;
  return discrepancy<=tolerance?{verified:true,confidence:observations.length>=3?"high" as const:"medium" as const,reason:"Independent observations agree within tolerance.",discrepancy}:{verified:false,confidence:"conflict" as const,reason:"Independent observations conflict beyond tolerance.",discrepancy};
}
