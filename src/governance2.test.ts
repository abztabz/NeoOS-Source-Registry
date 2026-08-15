import assert from "node:assert/strict";
import test from "node:test";
import { sourceRegistry } from "./registry.js";
import { assessEligibility,eligibleForProduction } from "./governance.js";
import { routeProviders } from "./router.js";

test("approved no-key provider is production eligible",()=>{const gdelt=sourceRegistry.find(p=>p.id==="gdelt-doc")!;assert.equal(eligibleForProduction(gdelt),true);});
test("blocked provider can never enter production",()=>{const blocked=sourceRegistry.find(p=>p.id==="gnews-free")!;assert.equal(assessEligibility(blocked,{production:true}).decision,"ineligible");});
test("experimental commercial source remains out of production",()=>{const serp=sourceRegistry.find(p=>p.id==="serpapi")!;assert.equal(assessEligibility(serp,{production:true,allowExperimental:true,secrets:{NEO_SERPAPI_KEY:"x"}}).decision,"ineligible");});
test("credentialed approved provider fails closed when secret is absent",()=>{const companies=sourceRegistry.find(p=>p.id==="companies-house")!;assert.equal(eligibleForProduction(companies),false);assert.equal(eligibleForProduction(companies,{NEO_COMPANIES_HOUSE_KEY:"x"}),true);});
test("experimental provider requires explicit non-production opt-in",()=>{const serp=sourceRegistry.find(p=>p.id==="serpapi")!;assert.equal(assessEligibility(serp,{production:false,secrets:{NEO_SERPAPI_KEY:"x"}}).decision,"ineligible");assert.equal(assessEligibility(serp,{production:false,allowExperimental:true,secrets:{NEO_SERPAPI_KEY:"x"}}).decision,"experimental-only");});
test("production router cannot use experimental SERP providers",()=>{assert.equal(routeProviders("seo-serp-discovery",{production:true,includeExperimental:true,secrets:{NEO_SERPAPI_KEY:"x",NEO_ZENSERP_KEY:"x"}}).length,0);assert.ok(routeProviders("seo-serp-discovery",{production:false,includeExperimental:true,secrets:{NEO_SERPAPI_KEY:"x"}}).length>0);});
