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
) => Promise<{ data: unknown; sourceObservedAt?: string | null }>;

export interface GatewayAttempt {
  provider: string;
  durationMs: number;
  outcome: "error" | "empty";
}

function hasUsableData(value: unknown): boolean {
  if (value == null) return false;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

export class NeoDataGateway {
  constructor(
    private providers: readonly GatewayProvider[],
    private adapters: Record<string, GatewayAdapter>,
    private now: () => Date = () => new Date(),
  ) {}

  async request(capability: string, input: Record<string, unknown>, options: { includeExperimental?: boolean } = {}) {
    const attempts: GatewayAttempt[] = [];
    const eligible = this.providers
      .filter((provider) => provider.capabilities.includes(capability))
      .filter((provider) => provider.status === "approved" || (options.includeExperimental && provider.status === "experimental"))
      .sort((a, b) => a.priority - b.priority);

    for (const provider of eligible) {
      const adapter = this.adapters[provider.id];
      if (!adapter) continue;
      const startedAt = this.now();
      try {
        const result = await adapter(input, provider);
        const finishedAt = this.now();
        const durationMs = Math.max(0, finishedAt.getTime() - startedAt.getTime());
        if (!result || !hasUsableData(result.data)) {
          attempts.push({ provider: provider.id, durationMs, outcome: "empty" });
          continue;
        }
        return {
          ok: true as const,
          capability,
          provider: provider.id,
          observedAt: finishedAt.toISOString(),
          sourceObservedAt: result.sourceObservedAt ?? null,
          durationMs,
          provenance: { provider: provider.name, attribution: provider.attribution ?? null, dataBoundary: provider.dataBoundary },
          data: result.data,
          attempts,
        };
      } catch {
        const finishedAt = this.now();
        attempts.push({ provider: provider.id, durationMs: Math.max(0, finishedAt.getTime() - startedAt.getTime()), outcome: "error" });
      }
    }

    return { ok: false as const, capability, observedAt: this.now().toISOString(), attempts, error: "No eligible provider returned usable data" };
  }
}
