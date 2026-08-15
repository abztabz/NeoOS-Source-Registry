import assert from "node:assert/strict";
import test from "node:test";
import { createDefaultAdapters } from "./providers/adapter-registry.js";

test("default adapter factory includes approved no-key adapters",()=>{const adapters=createDefaultAdapters({});assert.ok(adapters["gdelt-doc"]);assert.ok(adapters.crossref);assert.ok(adapters.datacite);assert.equal(adapters.serpapi,undefined);assert.equal(adapters.zenserp,undefined);});
test("experimental credentialed adapters are only instantiated when configured",()=>{const adapters=createDefaultAdapters({NEO_SERPAPI_KEY:"test",NEO_ZENSERP_KEY:"test"});assert.ok(adapters.serpapi);assert.ok(adapters.zenserp);});
