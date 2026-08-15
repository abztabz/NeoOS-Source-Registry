import assert from "node:assert/strict";
import test from "node:test";
import { sourceRegistry } from "../registry.js";
import { secEdgarAdapter } from "./sec-edgar.js";
import { worldBankAdapter } from "./world-bank.js";

const response=(body:unknown)=>new Response(JSON.stringify(body),{status:200,headers:{"content-type":"application/json"}});

test("World Bank adapter normalizes official indicator data",async()=>{
  const provider=sourceRegistry.find(p=>p.id==="world-bank-indicators")!;
  let requested="";
  const fetcher=(async(input:RequestInfo|URL)=>{requested=String(input);return response([{page:1},[{country:{value:"United Arab Emirates"},countryiso3code:"ARE",indicator:{id:"SP.POP.TOTL",value:"Population, total"},date:"2025",value:11000000,unit:""}]]);}) as typeof fetch;
  const result=await worldBankAdapter(fetcher)({country:"ARE",indicator:"SP.POP.TOTL",mrv:1},provider);
  assert.match(requested,/\/v2\/country\/ARE\/indicator\/SP.POP.TOTL/);
  assert.equal((result.data[0] as Record<string,unknown>).countryCode,"ARE");
  assert.equal((result.data[0] as Record<string,unknown>).verificationStatus,"official-source");
});

test("SEC adapter requires identification and bounds CIK",async()=>{
  const provider=sourceRegistry.find(p=>p.id==="sec-edgar")!;
  await assert.rejects(()=>secEdgarAdapter("")({cik:"320193"},provider),/User-Agent/);
  let requested="";
  const fetcher=(async(input:RequestInfo|URL)=>{requested=String(input);return response({cik:320193,entityName:"Apple Inc.",facts:{"us-gaap":{Assets:{label:"Assets",description:"Assets",units:{USD:[]}}}}});}) as typeof fetch;
  const result=await secEdgarAdapter("NeoOS registry@example.com",fetcher)({cik:"320193"},provider);
  assert.match(requested,/CIK0000320193\.json$/);
  assert.equal((result.data as Record<string,unknown>).entityName,"Apple Inc.");
});
