import { capabilityRegistry } from "./capabilities.js";
import { sourceRegistry } from "./registry.js";

export function safeCapabilitySnapshot(capabilityId?: string) {
  const capabilities = capabilityId ? capabilityRegistry.filter((capability) => capability.id === capabilityId) : capabilityRegistry;
  return capabilities.map((capability) => ({
    ...capability,
    providers: sourceRegistry.filter((provider) => provider.capabilities.includes(capability.id)).map((provider) => ({
      id:provider.id,name:provider.name,category:provider.category,status:provider.status,commercialUse:provider.commercialUse,freeTierUse:provider.freeTierUse,sourceQuality:provider.sourceQuality,priority:provider.priority,adapterStatus:provider.adapterStatus,attribution:provider.attribution??null,quota:provider.quota??null,freshnessPolicy:provider.freshnessPolicy,regionCoverage:provider.regionCoverage,dataBoundary:provider.dataBoundary,termsUrl:provider.termsUrl,documentationUrl:provider.documentationUrl,reviewedAt:provider.reviewedAt,reviewNotes:provider.reviewNotes??null
    }))
  }));
}
