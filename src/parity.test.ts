import assert from "node:assert/strict";
import test from "node:test";
import { sourceRegistry } from "./registry.js";

const requiredProviderIds = ["gdelt-doc","crossref","datacite","sec-edgar","companies-house","ecb-data-portal","world-bank-indicators","data-gov-catalog","met-norway-weather","google-public-dns","serpapi","zenserp","serper","arbeitnow-jobs","adzuna-jobs","alpha-vantage","twelve-data","coingecko","tmdb","nominatim-public","open-meteo-free","serpstack","guardian-developer","gnews-free"];

test("standalone registry preserves the governed provider universe", () => {
  const ids = new Set(sourceRegistry.map((provider) => provider.id));
  for (const id of requiredProviderIds) assert.ok(ids.has(id), id);
});

test("critical live adapters retain their lifecycle state", () => {
  const state = Object.fromEntries(sourceRegistry.map((provider) => [provider.id, {status:provider.status, adapterStatus:provider.adapterStatus}]));
  assert.deepEqual(state["gdelt-doc"], {status:"approved",adapterStatus:"live"});
  assert.deepEqual(state.crossref, {status:"approved",adapterStatus:"live"});
  assert.deepEqual(state.datacite, {status:"approved",adapterStatus:"live"});
  assert.deepEqual(state.serpapi, {status:"experimental",adapterStatus:"live"});
  assert.deepEqual(state.zenserp, {status:"experimental",adapterStatus:"live"});
});
