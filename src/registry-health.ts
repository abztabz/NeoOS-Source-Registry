import { capabilityRegistry } from "./capabilities.js";
import { sourceRegistry } from "./registry.js";
export function registryHealth(){const ready=capabilityRegistry.filter(c=>c.readiness==="ready");const missing=ready.filter(c=>!sourceRegistry.some(p=>p.status==="approved"&&p.capabilities.includes(c.id))).map(c=>c.id);return {ok:missing.length===0,readyCapabilities:ready.length,providers:sourceRegistry.length,missingApprovedProviders:missing};}
