import assert from "node:assert/strict";
import test from "node:test";
import { resolveCapabilityPolicy } from "./consumer-policy.js";

test("ready capability resolves to production providers",()=>{const result=resolveCapabilityPolicy("economic-data");assert.equal(result.ok,true);if(result.ok)assert.ok(result.providers.includes("ecb-data-portal"));});
test("experimental capability cannot silently become production",()=>{const result=resolveCapabilityPolicy("market-data");assert.equal(result.ok,false);if(!result.ok)assert.equal(result.reason,"experimental_only");});
test("explicit gap remains a governance gap",()=>{const result=resolveCapabilityPolicy("language-translation");assert.equal(result.ok,false);if(!result.ok)assert.equal(result.reason,"governance_gap");});
