import assert from "node:assert/strict";
import test from "node:test";
import { ecbFxAdapter } from "./ecb.js";
import { googlePublicDnsAdapter } from "./google-public-dns.js";
import { providerById } from "../registry.js";

const jsonResponse=(value:unknown)=>new Response(JSON.stringify(value),{status:200,headers:{"content-type":"application/json"}});

test("Google DNS adapter normalizes records and suppresses client subnet",async()=>{let seen="";const fetcher:typeof fetch=async(input)=>{seen=String(input);return jsonResponse({Status:0,AD:true,Answer:[{name:"example.com.",type:1,TTL:300,data:"93.184.216.34"}]});};const provider=providerById("google-public-dns")!;const result=await googlePublicDnsAdapter(fetcher)({name:"example.com",type:"A"},provider);assert.match(seen,/edns_client_subnet=0.0.0.0%2F0/);assert.deepEqual((result.data as any[])[0],{kind:"dns-record",name:"example.com.",type:1,ttl:300,data:"93.184.216.34",dnssecAuthenticated:true,responseStatus:0,verificationStatus:"official-resolver"});});

test("Google DNS adapter rejects unsupported record types",async()=>{const provider=providerById("google-public-dns")!;await assert.rejects(()=>googlePublicDnsAdapter(async()=>jsonResponse({}))({name:"example.com",type:"ANY"},provider));});

test("ECB adapter uses bounded official EXR series query",async()=>{let seen="";let accept="";const fetcher:typeof fetch=async(input,init)=>{seen=String(input);accept=new Headers(init?.headers).get("accept")??"";return jsonResponse({dataSets:[{series:{"0:0:0:0:0":{observations:{"0":[1.2]}}}}]});};const provider=providerById("ecb-data-portal")!;const result=await ecbFxAdapter(fetcher)({currency:"USD",limit:2},provider);assert.match(seen,/service\/data\/EXR\/D.USD.EUR.SP00.A/);assert.match(seen,/lastNObservations=2/);assert.match(accept,/sdmx\.data\+json/);assert.equal((result.data as any[])[0].verificationStatus,"official-source");});
