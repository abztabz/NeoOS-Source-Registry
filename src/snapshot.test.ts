import assert from "node:assert/strict";
import test from "node:test";
import { registrySnapshot } from "./snapshot.js";

test("versioned snapshot is safe and capability-filterable",()=>{const snapshot=registrySnapshot("economic-data");assert.equal(snapshot.schemaVersion,"neo-source-registry-v1");assert.equal(snapshot.capabilities.length,1);const json=JSON.stringify(snapshot);assert.equal(json.includes("NEO_"),false);assert.equal(json.includes("baseUrl"),false);});
