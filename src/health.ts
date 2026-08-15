export type ProviderHealthState="healthy"|"degraded"|"unreliable"|"quarantined"|"unknown";
export type ProviderFailureKind="auth"|"quota"|"schema"|"network"|"unknown";
export type ProviderHealthOutcome="success"|"empty"|"error";

export interface ProviderHealthEvent {
  providerId:string;
  observedAt:string;
  outcome:ProviderHealthOutcome;
  durationMs:number;
  failureKind?:ProviderFailureKind;
  stale?:boolean;
}

export interface ProviderHealthObservation {
  providerId:string;
  checkedAt:string;
  successRate:number;
  latencyMs:number;
  stale:boolean;
  schemaValid:boolean;
  authValid:boolean;
  quotaAvailable:boolean;
  sampleSize?:number;
  usableRate?:number;
  consecutiveFailures?:number;
  consecutiveSuccesses?:number;
}

export interface ProviderHealthAssessment { state:ProviderHealthState; score:number; reasons:string[]; }

export function assessProviderHealth(observation?:ProviderHealthObservation):ProviderHealthAssessment {
  if(!observation) return {state:"unknown",score:50,reasons:["No runtime health observation is available."]};
  const reasons:string[]=[]; let score=100;
  if(observation.successRate<0.95){score-=25;reasons.push("Success rate is below 95%.");}
  if(observation.successRate<0.75){score-=30;reasons.push("Success rate is below 75%.");}
  if((observation.sampleSize??0)>=5&&(observation.usableRate??1)<0.5){score-=15;reasons.push("Fewer than half of recent responses contained usable data.");}
  if(observation.latencyMs>3000){score-=10;reasons.push("Latency exceeds 3 seconds.");}
  if(observation.stale){score-=20;reasons.push("Observed data is stale.");}
  if(!observation.schemaValid){score-=35;reasons.push("Response schema validation failed.");}
  if(!observation.authValid){score-=50;reasons.push("Authentication is failing.");}
  if(!observation.quotaAvailable){score-=30;reasons.push("Provider quota is unavailable.");}
  if((observation.consecutiveFailures??0)>=3){score-=40;reasons.push("Three or more consecutive technical failures were observed.");}
  score=Math.max(0,score);
  const state:ProviderHealthState=score>=85?"healthy":score>=65?"degraded":score>=40?"unreliable":"quarantined";
  return {state,score,reasons:reasons.length?reasons:["Provider health signals are within policy."]};
}

const severity:Record<ProviderHealthState,number>={unknown:-1,healthy:0,degraded:1,unreliable:2,quarantined:3};
const stateAtSeverity=(value:number):ProviderHealthState=>value<=0?"healthy":value===1?"degraded":value===2?"unreliable":"quarantined";

function tailCount(events:readonly ProviderHealthEvent[],predicate:(event:ProviderHealthEvent)=>boolean):number {
  let count=0;
  for(let index=events.length-1;index>=0;index-=1){if(!predicate(events[index]))break;count+=1;}
  return count;
}

export class ProviderHealthMonitor {
  private readonly events=new Map<string,ProviderHealthEvent[]>();
  private readonly assessments=new Map<string,ProviderHealthAssessment>();

  constructor(private readonly windowSize=20,private readonly minimumSamples=3,private readonly recoverySuccesses=2) {
    if(windowSize<3) throw new Error("Health window must contain at least 3 samples");
    if(minimumSamples<1||minimumSamples>windowSize) throw new Error("Health minimum sample count is invalid");
    if(recoverySuccesses<1) throw new Error("Health recovery success count is invalid");
  }

  record(event:ProviderHealthEvent):ProviderHealthAssessment {
    const current=[...(this.events.get(event.providerId)??[]),event].slice(-this.windowSize);
    this.events.set(event.providerId,current);
    const observation=this.observation(event.providerId)!;
    const base=assessProviderHealth(observation);
    const previous=this.assessments.get(event.providerId)?.state??"unknown";
    const hardFailure=!observation.authValid||!observation.schemaValid||!observation.quotaAvailable||(observation.consecutiveFailures??0)>=3;
    let state=base.state;

    if(current.length<this.minimumSamples&&!hardFailure) state="unknown";
    else if(previous==="quarantined"&&base.state!=="quarantined") {
      if((observation.consecutiveSuccesses??0)<this.recoverySuccesses) state="quarantined";
      else state="unreliable";
    } else if(previous!=="unknown"&&severity[base.state]<severity[previous]) {
      state=stateAtSeverity(Math.max(0,severity[previous]-1));
    }

    const assessment:ProviderHealthAssessment={state,score:base.score,reasons:[...base.reasons]};
    if(previous==="quarantined"&&state==="quarantined"&&base.state!=="quarantined") assessment.reasons.push(`Recovery requires ${this.recoverySuccesses} consecutive successful responses.`);
    if(previous!=="unknown"&&severity[state]<severity[previous]&&severity[base.state]<severity[previous]) assessment.reasons.push("Recovery is deliberately limited to one health state per observation to prevent flapping.");
    this.assessments.set(event.providerId,assessment);
    return assessment;
  }

  observation(providerId:string):ProviderHealthObservation|undefined {
    const events=this.events.get(providerId);
    if(!events?.length) return undefined;
    const technicalSuccess=events.filter(event=>event.outcome!=="error").length;
    const usable=events.filter(event=>event.outcome==="success").length;
    const measured=events.filter(event=>event.outcome!=="error");
    const latencyMs=measured.length?Math.round(measured.reduce((sum,event)=>sum+Math.max(0,event.durationMs),0)/measured.length):Math.round(events.reduce((sum,event)=>sum+Math.max(0,event.durationMs),0)/events.length);
    const recent=events.slice(-3);
    return {
      providerId,
      checkedAt:events[events.length-1].observedAt,
      successRate:technicalSuccess/events.length,
      latencyMs,
      stale:recent.some(event=>event.stale===true),
      schemaValid:!recent.some(event=>event.failureKind==="schema"),
      authValid:!recent.some(event=>event.failureKind==="auth"),
      quotaAvailable:!recent.some(event=>event.failureKind==="quota"),
      sampleSize:events.length,
      usableRate:usable/events.length,
      consecutiveFailures:tailCount(events,event=>event.outcome==="error"),
      consecutiveSuccesses:tailCount(events,event=>event.outcome==="success"),
    };
  }

  assessment(providerId:string):ProviderHealthAssessment {
    return this.assessments.get(providerId)??assessProviderHealth(this.observation(providerId));
  }

  snapshot():Record<string,ProviderHealthObservation|undefined> {
    return Object.fromEntries([...this.events.keys()].map(providerId=>[providerId,this.observation(providerId)]));
  }

  assessmentSnapshot():Record<string,ProviderHealthAssessment> {
    return Object.fromEntries([...this.events.keys()].map(providerId=>[providerId,this.assessment(providerId)]));
  }
}

export function classifyProviderFailure(error:unknown):ProviderFailureKind {
  const message=error instanceof Error?error.message:String(error??"");
  if(/\b(401|403)\b|auth(?:entication|orization)?|credential/i.test(message)) return "auth";
  if(/\b429\b|quota|rate[ -]?limit/i.test(message)) return "quota";
  if(/schema|invalid json|json payload is invalid|did not return json/i.test(message)) return "schema";
  if(/abort|timeout|timed out|network|fetch|econn|enotfound|socket/i.test(message)) return "network";
  return "unknown";
}
