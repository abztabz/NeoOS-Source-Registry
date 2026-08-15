import { sourceRegistry } from "./registry.js";
export function providerStatusSummary(){return sourceRegistry.reduce<Record<string,number>>((out,p)=>{out[p.status]=(out[p.status]??0)+1;return out;},{});}
