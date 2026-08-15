import assert from "node:assert/strict";
import test from "node:test";
import { safeCapabilitySnapshot } from "./registry-view.js";

test("safe capability snapshot can filter without exposing secrets", () => {
  const snapshot=safeCapabilitySnapshot("economic-data");
  assert.equal(snapshot.length,1); assert.equal(snapshot[0]?.id,"economic-data");
  const serialized=JSON.stringify(snapshot); assert.equal(serialized.includes("NEO_"),false); assert.equal(serialized.includes("secretEnvName"),false); assert.equal(serialized.includes("baseUrl"),false);
});
