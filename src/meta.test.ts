import assert from "node:assert/strict";
import test from "node:test";
import { neoOsRegistryMeta } from "./meta.js";
test("registry is explicitly shared and registry-first",()=>{assert.equal(neoOsRegistryMeta.ownership,"shared-neoos-infrastructure");assert.equal(neoOsRegistryMeta.registryFirst,true);});
