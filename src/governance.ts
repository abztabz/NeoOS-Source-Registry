import type { SourceProvider } from "./registry.js";

export type EligibilityDecision="eligible"|"experimental-only"|"ineligible";
export interface EligibilityContext { production:boolean; allowExperimental?:boolean; secrets?:Record<string,string|undefined>; }
export interface EligibilityResult { decision:EligibilityDecision; reasons:string[]; }

export function assessEligibility(provider:SourceProvider,context:EligibilityContext):EligibilityResult {
  const reasons:string[]=[];
  if(provider.status==="blocked"||provider.status==="retired") reasons.push(`Provider lifecycle status is ${provider.status}.`);
  if(provider.commercialUse==="blocked") reasons.push("Commercial use is blocked.");
  if(context.production&&provider.commercialUse!=="approved") reasons.push("Commercial-use approval is required for production.");
  if(context.production&&!(["production_allowed","not_applicable"] as const).includes(provider.freeTierUse as "production_allowed"|"not_applicable")) reasons.push("Current access entitlement is not approved for production.");
  if(provider.auth==="api-key"||provider.auth==="oauth") {
    if(!provider.secretEnvName) reasons.push("Credentialed provider is missing a declared server-side secret binding.");
    else if(context.production&&!context.secrets?.[provider.secretEnvName]) reasons.push("Required server-side credential is unavailable.");
  }
  if(provider.status==="experimental"&&!context.allowExperimental) reasons.push("Experimental providers require an explicit opt-in.");
  if(reasons.length) return {decision:provider.status==="experimental"&&!context.production&&context.allowExperimental&&provider.commercialUse!=="blocked"?"experimental-only":"ineligible",reasons};
  return {decision:provider.status==="experimental"?"experimental-only":"eligible",reasons:["Provider satisfies machine-enforced eligibility policy."]};
}

export function eligibleForProduction(provider:SourceProvider,secrets:Record<string,string|undefined>={}):boolean {
  return assessEligibility(provider,{production:true,secrets}).decision==="eligible";
}
