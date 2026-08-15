import assert from "node:assert/strict";
import test from "node:test";
import { sourceRegistry } from "./registry.js";
import { createDefaultAdapters } from "./providers/adapter-registry.js";
import { companiesHouseAdapter } from "./providers/companies-house.js";
import { metNorwayAdapter } from "./providers/met-norway.js";

test("credentialed official adapters fail closed when configuration is absent",()=>{
  const adapters=createDefaultAdapters({});
  assert.equal(adapters["companies-house"],undefined);
  assert.equal(adapters["met-norway-weather"],undefined);
});

test("Companies House sends API key only in Basic authorization header",async()=>{
  const provider=sourceRegistry.find(item=>item.id==="companies-house")!;
  let observedUrl=""; let observedAuth="";
  const mockFetch:typeof fetch=async(input,init)=>{observedUrl=String(input);observedAuth=new Headers(init?.headers).get("authorization")??"";return new Response(JSON.stringify({items:[{company_number:"12345678",title:"Example Ltd",company_status:"active",company_type:"ltd",date_of_creation:"2020-01-01"}]}),{status:200,headers:{"content-type":"application/json"}});};
  const result=await companiesHouseAdapter("secret-key",mockFetch)({query:"Example",limit:5},provider);
  assert.ok(observedAuth.startsWith("Basic "));
  assert.equal(observedUrl.includes("secret-key"),false);
  assert.equal(JSON.stringify(result).includes("secret-key"),false);
  assert.equal((result.data as Array<Record<string,unknown>>)[0]?.companyNumber,"12345678");
});

test("MET Norway bounds coordinates and sends identifying user agent",async()=>{
  const provider=sourceRegistry.find(item=>item.id==="met-norway-weather")!;
  let observedAgent=""; let observedUrl="";
  const mockFetch:typeof fetch=async(input,init)=>{observedUrl=String(input);observedAgent=new Headers(init?.headers).get("user-agent")??"";return new Response(JSON.stringify({properties:{timeseries:[{time:"2026-08-15T12:00:00Z",data:{instant:{details:{air_temperature:31.2,relative_humidity:44,wind_speed:3.1,wind_from_direction:280}}}}]}}),{status:200,headers:{"content-type":"application/json"}});};
  const result=await metNorwayAdapter("NeoOS Source Registry contact@example.com",mockFetch)({lat:25.2048,lon:55.2708},provider);
  assert.ok(observedUrl.includes("lat=25.2048"));
  assert.equal(observedAgent,"NeoOS Source Registry contact@example.com");
  assert.equal((result.data as Array<Record<string,unknown>>)[0]?.airTemperature,31.2);
  await assert.rejects(()=>metNorwayAdapter("NeoOS Source Registry contact@example.com",mockFetch)({lat:91,lon:55},provider));
});
