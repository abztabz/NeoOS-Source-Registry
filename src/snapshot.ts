import { NEO_SOURCE_REGISTRY_SCHEMA_VERSION } from "./version.js";
import { safeCapabilitySnapshot } from "./registry-view.js";

export function registrySnapshot(capability?: string) {
  return { schemaVersion:NEO_SOURCE_REGISTRY_SCHEMA_VERSION, scope:"shared-public-governance-metadata" as const, capabilities:safeCapabilitySnapshot(capability) };
}
