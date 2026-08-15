import { capabilityRegistry } from "./capabilities.js";
import { sourceRegistry } from "./registry.js";

export const neoOsSourceCatalog = Object.freeze({ capabilities:capabilityRegistry, providers:sourceRegistry });
