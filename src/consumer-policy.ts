import { capabilityById } from "./capabilities.js";
import { providersFor } from "./registry.js";

export function resolveCapabilityPolicy(capabilityId: string) {
  const capability=capabilityById(capabilityId);
  if(!capability) return {ok:false as const,reason:"unknown_capability" as const};
  if(capability.readiness==="gap") return {ok:false as const,reason:"governance_gap" as const,capability};
  const approved=providersFor(capabilityId);
  if(approved.length) return {ok:true as const,capability,mode:"production" as const,providers:approved.map((provider)=>provider.id)};
  return {ok:false as const,reason:"experimental_only" as const,capability,providers:providersFor(capabilityId,{includeExperimental:true}).map((provider)=>provider.id)};
}
