import assert from "node:assert/strict";
import test from "node:test";
import { NeoDataGateway, type GatewayProvider } from "./gateway.js";

const providers: GatewayProvider[] = [
  { id: "approved-a", name: "A", status: "approved", priority: 10, capabilities: ["demo"], dataBoundary: "public" },
  { id: "approved-b", name: "B", status: "approved", priority: 20, capabilities: ["demo"], dataBoundary: "public" },
  { id: "experimental", name: "X", status: "experimental", priority: 5, capabilities: ["experimental-demo"], dataBoundary: "public" },
  { id: "blocked", name: "Blocked", status: "blocked", priority: 1, capabilities: ["demo"], dataBoundary: "blocked" }
];

test("falls back after empty approved provider and never selects blocked", async () => {
  const gateway = new NeoDataGateway(providers, {
    "approved-a": async () => ({ data: [] }),
    "approved-b": async () => ({ data: [{ ok: true }] }),
    blocked: async () => { throw new Error("must never run"); }
  });
  const result = await gateway.request("demo", {});
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.provider, "approved-b");
});

test("experimental providers fail closed by default", async () => {
  const gateway = new NeoDataGateway(providers, { experimental: async () => ({ data: [1] }) });
  assert.equal((await gateway.request("experimental-demo", {})).ok, false);
  assert.equal((await gateway.request("experimental-demo", {}, { includeExperimental: true })).ok, true);
});
