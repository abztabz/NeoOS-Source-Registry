import { NeoDataGateway } from "./gateway.js";
import { ProviderHealthMonitor } from "./health.js";
import { sourceRegistry } from "./registry.js";
import { createDefaultAdapters } from "./providers/adapter-registry.js";

export const runtimeProviderHealthMonitor=new ProviderHealthMonitor();

export function createNeoDataGateway(env: Record<string,string|undefined> = process.env,health:ProviderHealthMonitor=runtimeProviderHealthMonitor) {
  return new NeoDataGateway(sourceRegistry, createDefaultAdapters(env),()=>new Date(),health);
}
