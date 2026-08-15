import assert from "node:assert/strict";
import test from "node:test";
import { sourceRegistry } from "./registry.js";
import { sourceTrustScore } from "./trust.js";
import { assessProviderHealth } from "./health.js";
import { routeProviders } from "./router.js";
import { verifyNumericObservations } from "./verification.js";
import { acceptDiscovery,advanceCandidate } from "./scout.js";

test("official approved sources outrank blocked sources",()=>{const ecb=sourceRegistry.find(p=>p.id==="ecb-data-portal")!;const blocked=sourceRegistry.find(p=>p.id==="gnews-free")!;assert.ok(sourceTrustScore(ecb).score>sourceTrustScore(blocked).score);assert.equal(sourceTrustScore(blocked).band,"blocked");});
test("health assessment quarantines broken providers",()=>{const result=assessProviderHealth({providerId:"x",checkedAt:new Date().toISOString(),successRate:.4,latencyMs:5000,stale:true,schemaValid:false,authValid:false,quotaAvailable:false});assert.equal(result.state,"quarantined");});
test("router excludes blocked providers",()=>{const routes=routeProviders("news-discovery");assert.ok(routes.length>0);assert.equal(routes.some(route=>route.provider.status==="blocked"),false);});
test("verification detects conflicting numeric sources",()=>{const result=verifyNumericObservations({capability:"fx-rates",mode:"independent-confirmation",minimumSources:2,discrepancyTolerance:.01},[{providerId:"a",value:100,observedAt:"now"},{providerId:"b",value:120,observedAt:"now"}]);assert.equal(result.verified,false);assert.equal(result.confidence,"conflict");});
test("Source Scout cannot skip governance review",()=>{const candidate=acceptDiscovery({id:" Example ",name:"Example",capability:"demo",documentationUrl:"https://example.com/docs",discoveredAt:"now",discoveredFrom:"catalog",state:"discovered"});assert.throws(()=>advanceCandidate(candidate,"experimental"));assert.equal(advanceCandidate(advanceCandidate(candidate,"reviewing"),"experimental").state,"experimental");});
