import { classifyProviderFailure, ProviderHealthMonitor, type ProviderHealthState } from "./health.js";

export type ProviderStatus = "approved" | "experimental" | "blocked" | "retired";

export interface GatewayProvider {
  id: string;
  name: string;
  status: ProviderStatus;
  priority: number;
  capabilities: string[];
  attribution?: string;
  dataBoundary: string;
}

export type GatewayAdapter = (
  input: Record<string, unknown>,
  provider: GatewayProvider,
) => Promise<{ data: unknown; sourceObservedAt?: string | null; stale?: boolean }>;

export interface GatewayAttempt {
  provider: string;
  durationMs: number;
  outcome: "error" | "empty";
  healthState?: ProviderHealthState;
}

function hasUsableData(value: unknown): boolean {
  if (value == null) return false;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

const healthPenalty:Record<ProviderHealthState,number>={healthy:0,unknown:0,degraded:100,unreliable:500,quarantined:Number.POSITIVE_INFINITY};

export class NeoDataGateway {
  constructor(
    private providers: readonly GatewayProvider[],
    private adapters: Record<string, GatewayAdapter>,
    private now: () => Date = () => new Date(),
    private health = new ProviderHealthMonitor(),
  ) {}

  healthAssessment(providerId:string) { return this.health.assessment(providerId); }
  healthSnapshot() { return this.health.snapshot(); }
  healthAssessmentSnapshot() { return this.health.assessmentSnapshot(); }

  async request(capability: string, input: Record<string, unknown>, options: { includeExperimental?: boolean } = {}) {
    const attempts: GatewayAttempt[] = [];
    const eligible = this.providers
      .filter((provider) => provider.capabilities.includes(capability))
      .filter((provider) => provider.status === "approved" || (options.includeExperimental && provider.status === "experimental"))
      .filter((provider) => this.health.assessment(provider.id).state !== "quarantined")
      .sort((a, b) => {
        const aState=this.health.assessment(a.id).state;
        const bState=this.health.assessment(b.id).state;
        return healthPenalty[aState]-healthPenalty[bState]||a.priority-b.priority;
      });

    for (const provider of eligible) {
      const adapter = this.adapters[provider.id];
      if (!adapter) continue;
      const startedAt = this.now();
      try {
        const result = await adapter(input, provider);
        const finishedAt = this.now();
        const durationMs = Math.max(0, finishedAt.getTime() - startedAt.getTime());
        if (!result || !hasUsableData(result.data)) {
          const assessment=this.health.record({providerId:provider.id,observedAt:finishedAt.toISOString(),outcome:"empty",durationMs,stale:result?.stale});
          attempts.push({ provider: provider.id, durationMs, outcome: "empty",healthState:assessment.state });
          continue;
        }
        const assessment=this.health.record({providerId:provider.id,observedAt:finishedAt.toISOString(),outcome:"success",durationMs,stale:result.stale});
        return {
          ok: true as const,
          capability,
          provider: provider.id,
          observedAt: finishedAt.toISOString(),
          sourceObservedAt: result.sourceObservedAt ?? null,
          durationMs,
          providerHealth:{state:assessment.state,score:assessment.score},
          provenance: { provider: provider.name, attribution: provider.attribution ?? null, dataBoundary: provider.dataBoundary },
          data: result.data,
          attempts,
        };
      } catch (error) {
        const finishedAt = this.now();
        const durationMs=Math.max(0, finishedAt.getTime() - startedAt.getTime());
        const assessment=this.health.record({providerId:provider.id,observedAt:finishedAt.toISOString(),outcome:"error",durationMs,failureKind:classifyProviderFailure(error)});
        attempts.push({ provider: provider.id, durationMs, outcome: "error",healthState:assessment.state });
      }
    }

    return { ok: false as const, capability, observedAt: this.now().toISOString(), attempts, error: "No eligible provider returned usable data" };
  }
}
