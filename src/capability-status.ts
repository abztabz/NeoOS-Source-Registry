import { capabilityRegistry } from "./capabilities.js";
export function capabilityStatusSummary(){return capabilityRegistry.reduce<Record<string,number>>((out,c)=>{out[c.readiness]=(out[c.readiness]??0)+1;return out;},{});}
