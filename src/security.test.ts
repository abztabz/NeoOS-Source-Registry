import assert from "node:assert/strict";
import test from "node:test";
import { sourceRegistry } from "./registry.js";

test("blocked providers are explicitly non-live",()=>{for(const provider of sourceRegistry.filter((candidate)=>candidate.status==="blocked"))assert.equal(provider.adapterStatus,"not_applicable",provider.id);});
test("experimental providers cannot masquerade as commercially approved free production sources",()=>{for(const provider of sourceRegistry.filter((candidate)=>candidate.status==="experimental"))assert.notEqual(provider.freeTierUse,"production_allowed",provider.id);});
