export type CandidateState="discovered"|"reviewing"|"experimental"|"rejected";
export interface SourceCandidate { id:string; name:string; capability:string; documentationUrl:string; discoveredAt:string; discoveredFrom:string; state:CandidateState; notes?:string; }

export function acceptDiscovery(input:SourceCandidate):SourceCandidate {
  const url=new URL(input.documentationUrl); if(url.protocol!=="https:")throw new Error("Candidate documentation must use HTTPS");
  if(input.state!=="discovered")throw new Error("New Source Scout candidates must enter as discovered");
  return {...input,id:input.id.trim().toLowerCase(),name:input.name.trim(),capability:input.capability.trim()};
}

export function advanceCandidate(candidate:SourceCandidate,next:CandidateState):SourceCandidate {
  const allowed:Record<CandidateState,CandidateState[]>={discovered:["reviewing","rejected"],reviewing:["experimental","rejected"],experimental:["rejected"],rejected:[]};
  if(!allowed[candidate.state].includes(next))throw new Error(`Invalid candidate transition: ${candidate.state} -> ${next}`);
  return {...candidate,state:next};
}
