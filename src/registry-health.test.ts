import assert from "node:assert/strict";
import test from "node:test";
import { registryHealth } from "./registry-health.js";
test("standalone registry is structurally healthy",()=>{const health=registryHealth();assert.equal(health.ok,true);assert.deepEqual(health.missingApprovedProviders,[]);});
