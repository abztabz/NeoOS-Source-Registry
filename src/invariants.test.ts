import assert from "node:assert/strict";
import test from "node:test";
import { capabilityRegistry } from "./capabilities.js";
import { sourceRegistry } from "./registry.js";

test("capability ids are unique",()=>{const ids=capabilityRegistry.map((item)=>item.id);assert.equal(ids.length,new Set(ids).size);});
test("approved provider priority is deterministic within a capability",()=>{for(const capability of capabilityRegistry){const priorities=sourceRegistry.filter((p)=>p.status==="approved"&&p.capabilities.includes(capability.id)).map((p)=>p.priority);assert.equal(priorities.length,new Set(priorities).size,capability.id);}});
