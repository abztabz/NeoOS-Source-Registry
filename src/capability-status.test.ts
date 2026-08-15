import assert from "node:assert/strict";
import test from "node:test";
import { capabilityStatusSummary } from "./capability-status.js";
test("registry explicitly covers ready, experimental and gap capability states",()=>{const s=capabilityStatusSummary();assert.ok((s.ready??0)>0);assert.ok((s.experimental??0)>0);assert.ok((s.gap??0)>0);});
