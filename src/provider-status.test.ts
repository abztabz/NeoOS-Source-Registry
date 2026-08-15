import assert from "node:assert/strict";
import test from "node:test";
import { providerStatusSummary } from "./provider-status.js";
test("registry has approved, experimental and blocked lifecycle coverage",()=>{const s=providerStatusSummary();assert.ok((s.approved??0)>0);assert.ok((s.experimental??0)>0);assert.ok((s.blocked??0)>0);});
