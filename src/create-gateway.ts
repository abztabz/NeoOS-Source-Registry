import { NeoDataGateway } from "./gateway.js";
import { sourceRegistry } from "./registry.js";
import { createDefaultAdapters } from "./providers/adapter-registry.js";

export function createNeoDataGateway(env: Record<string,string|undefined> = process.env) {
  return new NeoDataGateway(sourceRegistry, createDefaultAdapters(env));
}
