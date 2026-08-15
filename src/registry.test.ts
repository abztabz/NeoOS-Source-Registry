import assert from "node:assert/strict";
import test from "node:test";
import { capabilityRegistry } from "./capabilities.js";
import { providersFor, safeRegistrySnapshot, sourceRegistry } from "./registry.js";

test("every provider capability is declared", () => {
  const declared = new Set(capabilityRegistry.map((capability) => capability.id));
  for (const provider of sourceRegistry) for (const capability of provider.capabilities) assert.ok(declared.has(capability), `${provider.id}: ${capability}`);
});

test("ready capabilities have approved providers and gaps have none", () => {
  for (const capability of capabilityRegistry) {
    const providers = sourceRegistry.filter((provider) => provider.capabilities.includes(capability.id));
    if (capability.readiness === "ready") assert.ok(providers.some((provider) => provider.status === "approved"), capability.id);
    if (capability.readiness === "experimental") {
      assert.equal(providers.some((provider) => provider.status === "approved"), false, capability.id);
      assert.ok(providers.some((provider) => provider.status === "experimental"), capability.id);
    }
    if (capability.readiness === "gap") assert.equal(providers.length, 0, capability.id);
  }
});

test("blocked providers can never be selected", () => {
  for (const capability of capabilityRegistry) assert.equal(providersFor(capability.id, { includeExperimental: true }).some((provider) => provider.status === "blocked"), false);
});

test("safe snapshot excludes secret environment names and provider base URLs", () => {
  const serialized = JSON.stringify(safeRegistrySnapshot());
  assert.equal(serialized.includes("secretEnvName"), false);
  assert.equal(serialized.includes("NEO_"), false);
  assert.equal(serialized.includes("baseUrl"), false);
});

test("approved providers have production-eligible commercial boundaries", () => {
  for (const provider of sourceRegistry.filter((candidate) => candidate.status === "approved")) {
    assert.equal(provider.commercialUse, "approved", provider.id);
    assert.notEqual(provider.freeTierUse, "evaluation_only", provider.id);
    assert.notEqual(provider.freeTierUse, "not_available", provider.id);
  }
});
