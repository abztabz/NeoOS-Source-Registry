import assert from "node:assert/strict";
import test from "node:test";
import { protectedQueryResponse, publicHealthResponse, publicRegistryResponse, type GatewayRuntime, type RuntimeRequest } from "./runtime.js";

const token = "0123456789abcdefghijklmnop";
const baseHeaders = { "x-neo-consumer": "neocontent", authorization: `Bearer ${token}` };

function request(overrides: Partial<RuntimeRequest> = {}): RuntimeRequest {
  return { method: "POST", path: "/api/v1/query", headers: baseHeaders, body: { capability: "economic-data", input: { country: "AE", indicator: "NY.GDP.MKTP.CD" } }, ...overrides };
}

function gateway(result: unknown, calls: Array<{ capability:string; input:Record<string,unknown>; includeExperimental?:boolean }> = []): GatewayRuntime {
  return {
    async request(capability, input, options = {}) {
      calls.push({ capability, input, includeExperimental: options.includeExperimental });
      return result as Awaited<ReturnType<GatewayRuntime["request"]>>;
    },
  };
}

test("public liveness exposes service metadata only", () => {
  const result = publicHealthResponse();
  assert.equal(result.status, 200);
  assert.equal(result.body.service, "neo-data-gateway");
  assert.equal(result.body.status, "ok");
});

test("public registry is safe metadata and rejects unknown capability", () => {
  const ok = publicRegistryResponse({ method:"GET", path:"/api/v1/registry", headers:{}, query:{ capability:"economic-data" } });
  assert.equal(ok.status, 200);
  const serialized = JSON.stringify(ok.body);
  assert.equal(serialized.includes("secretEnvName"), false);
  assert.equal(serialized.includes("baseUrl"), false);
  const missing = publicRegistryResponse({ method:"GET", path:"/api/v1/registry", headers:{}, query:{ capability:"not-real" } });
  assert.equal(missing.status, 404);
});

test("execution fails closed when consumer auth is not configured", async () => {
  const result = await protectedQueryResponse(request(), {}, gateway({ ok:true }));
  assert.equal(result.status, 503);
});

test("execution rejects wrong consumer token without invoking providers", async () => {
  const calls: Array<{ capability:string; input:Record<string,unknown>; includeExperimental?:boolean }> = [];
  const result = await protectedQueryResponse(request({ headers:{ ...baseHeaders, authorization:"Bearer wrong-token-that-is-long-enough" } }), { NEO_GATEWAY_CONSUMER_TOKENS: JSON.stringify({ neocontent: token }) }, gateway({ ok:true }, calls));
  assert.equal(result.status, 401);
  assert.equal(calls.length, 0);
});

test("authorized consumer receives normalized gateway response", async () => {
  const calls: Array<{ capability:string; input:Record<string,unknown>; includeExperimental?:boolean }> = [];
  const result = await protectedQueryResponse(request(), { NEO_GATEWAY_CONSUMER_TOKENS: JSON.stringify({ neocontent: token }) }, gateway({ ok:true, capability:"economic-data", provider:"world-bank-indicators", data:[{ value:1 }], attempts:[] }, calls));
  assert.equal(result.status, 200);
  assert.equal(result.body.consumer, "neocontent");
  assert.equal(result.body.provider, "world-bank-indicators");
  assert.equal(typeof result.body.requestId, "string");
  assert.equal(calls.length, 1);
  assert.equal(calls[0]?.includeExperimental, false);
});

test("experimental routing requires runtime opt-in as well as request opt-in", async () => {
  const env = { NEO_GATEWAY_CONSUMER_TOKENS: JSON.stringify({ neocontent: token }) };
  const denied = await protectedQueryResponse(request({ body:{ capability:"seo-serp-discovery", input:{ query:"test" }, includeExperimental:true } }), env, gateway({ ok:true }));
  assert.equal(denied.status, 403);

  const calls: Array<{ capability:string; input:Record<string,unknown>; includeExperimental?:boolean }> = [];
  const allowed = await protectedQueryResponse(request({ body:{ capability:"seo-serp-discovery", input:{ query:"test" }, includeExperimental:true } }), { ...env, NEO_GATEWAY_ALLOW_EXPERIMENTAL:"true" }, gateway({ ok:true, capability:"seo-serp-discovery", provider:"serpapi", data:[1], attempts:[] }, calls));
  assert.equal(allowed.status, 200);
  assert.equal(calls[0]?.includeExperimental, true);
});
