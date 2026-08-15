import assert from "node:assert/strict";
import test from "node:test";
import { NeoDataGateway, type GatewayProvider } from "./gateway.js";
import { ProviderHealthMonitor } from "./health.js";

test("health monitor quarantines repeated technical failures and recovers gradually",()=>{
  const monitor=new ProviderHealthMonitor(5,3,2);
  const failure=(second:number)=>monitor.record({providerId:"a",observedAt:`2026-08-15T12:00:0${second}Z`,outcome:"error",durationMs:500,failureKind:"network"});
  failure(1); failure(2);
  assert.equal(failure(3).state,"quarantined");

  const success=(second:number)=>monitor.record({providerId:"a",observedAt:`2026-08-15T12:00:${second}Z`,outcome:"success",durationMs:200});
  assert.equal(success(10).state,"quarantined");
  assert.equal(success(11).state,"quarantined");
  assert.equal(success(12).state,"unreliable");
  assert.equal(success(13).state,"degraded");
  assert.equal(success(14).state,"healthy");
});

test("gateway stops routing consumer traffic to a quarantined provider",async()=>{
  const providers:GatewayProvider[]=[
    {id:"primary",name:"Primary",status:"approved",priority:10,capabilities:["demo"],dataBoundary:"public"},
    {id:"fallback",name:"Fallback",status:"approved",priority:20,capabilities:["demo"],dataBoundary:"public"},
  ];
  let primaryCalls=0;
  const gateway=new NeoDataGateway(providers,{
    primary:async()=>{primaryCalls+=1;throw new Error("network timeout");},
    fallback:async()=>({data:[{ok:true}]})
  });

  for(let index=0;index<3;index+=1){
    const result=await gateway.request("demo",{});
    assert.equal(result.ok,true);
  }
  assert.equal(gateway.healthAssessment("primary").state,"quarantined");

  const result=await gateway.request("demo",{});
  assert.equal(result.ok,true);
  if(result.ok) assert.equal(result.provider,"fallback");
  assert.equal(primaryCalls,3);
});

test("authentication and quota failures are classified as hard health signals",()=>{
  const auth=new ProviderHealthMonitor();
  const authState=auth.record({providerId:"auth",observedAt:"2026-08-15T12:00:00Z",outcome:"error",durationMs:100,failureKind:"auth"});
  assert.notEqual(authState.state,"unknown");
  assert.equal(auth.observation("auth")?.authValid,false);

  const quota=new ProviderHealthMonitor();
  quota.record({providerId:"quota",observedAt:"2026-08-15T12:00:00Z",outcome:"error",durationMs:100,failureKind:"quota"});
  assert.equal(quota.observation("quota")?.quotaAvailable,false);
});
