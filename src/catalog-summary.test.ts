import assert from "node:assert/strict";
import test from "node:test";
import { sourceRegistry } from "./registry.js";

test("provider ids are unique",()=>{const ids=sourceRegistry.map((provider)=>provider.id);assert.equal(new Set(ids).size,ids.length);});
test("provider policy URLs use HTTPS",()=>{for(const provider of sourceRegistry){assert.match(provider.termsUrl,/^https:\/\//,provider.id);assert.match(provider.documentationUrl,/^https:\/\//,provider.id);assert.match(provider.baseUrl,/^https:\/\//,provider.id);}});
test("credentialed approved providers name a server-side secret",()=>{for(const provider of sourceRegistry.filter((candidate)=>candidate.status==="approved"&&candidate.auth==="api-key"))assert.match(provider.secretEnvName??"",/^NEO_[A-Z0-9_]+$/,provider.id);});
