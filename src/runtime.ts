import { randomUUID, timingSafeEqual } from "node:crypto";
import type { NeoDataGateway } from "./gateway.js";
import { capabilityRegistry } from "./capabilities.js";
import { safeCapabilitySnapshot } from "./registry-view.js";
import { NEO_SOURCE_REGISTRY_PACKAGE_VERSION, NEO_SOURCE_REGISTRY_SCHEMA_VERSION } from "./version.js";

export const NEO_DATA_GATEWAY_RUNTIME_SCHEMA_VERSION = "neo-data-gateway-runtime-v1" as const;
export const NEO_DATA_GATEWAY_RESPONSE_SCHEMA_VERSION = "neo-data-gateway-response-v1" as const;

export interface RuntimeRequest {
  method: string;
  path: string;
  headers: Record<string, string | string[] | undefined>;
  query?: Record<string, string | string[] | undefined>;
  body?: unknown;
}

export interface RuntimeResponse {
  status: number;
  headers: Record<string, string>;
  body: Record<string, unknown>;
}

export interface GatewayRuntime {
  request(capability: string, input: Record<string, unknown>, options?: { includeExperimental?: boolean }): ReturnType<NeoDataGateway["request"]>;
}

type RuntimeEnv = Record<string, string | undefined>;

const BASE_HEADERS = Object.freeze({
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store, max-age=0",
  "x-content-type-options": "nosniff",
  "referrer-policy": "no-referrer",
});

function response(status: number, body: Record<string, unknown>, extraHeaders: Record<string, string> = {}): RuntimeResponse {
  return { status, headers: { ...BASE_HEADERS, ...extraHeaders }, body };
}

function headerValue(headers: RuntimeRequest["headers"], name: string): string {
  const value = headers[name.toLowerCase()] ?? headers[name] ?? Object.entries(headers).find(([key]) => key.toLowerCase() === name.toLowerCase())?.[1];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function safeConsumer(value: string): string {
  const normalized = value.trim().toLowerCase();
  return /^[a-z0-9][a-z0-9-]{1,63}$/.test(normalized) ? normalized : "";
}

function parseConsumerTokens(env: RuntimeEnv): Record<string, string> {
  const raw = env.NEO_GATEWAY_CONSUMER_TOKENS?.trim();
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const entries = Object.entries(parsed as Record<string, unknown>).flatMap(([consumer, token]) => {
      const id = safeConsumer(consumer);
      const secret = typeof token === "string" ? token.trim() : "";
      return id && secret.length >= 24 ? [[id, secret] as const] : [];
    });
    return Object.fromEntries(entries);
  } catch {
    return {};
  }
}

function constantTimeMatch(actual: string, expected: string): boolean {
  const a = Buffer.from(actual);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function authorizeConsumer(request: RuntimeRequest, env: RuntimeEnv): { ok: true; consumer: string } | { ok: false; status: 401 | 503 } {
  const tokens = parseConsumerTokens(env);
  if (Object.keys(tokens).length === 0) return { ok: false, status: 503 };
  const consumer = safeConsumer(headerValue(request.headers, "x-neo-consumer"));
  const authorization = headerValue(request.headers, "authorization");
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  const expected = consumer ? tokens[consumer] : undefined;
  if (!consumer || !token || !expected || !constantTimeMatch(token, expected)) return { ok: false, status: 401 };
  return { ok: true, consumer };
}

function plainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function capabilityExists(capability: string): boolean {
  return capabilityRegistry.some((entry) => entry.id === capability);
}

function queryValue(query: RuntimeRequest["query"], key: string): string {
  const value = query?.[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export function publicHealthResponse(): RuntimeResponse {
  return response(200, {
    schemaVersion: NEO_DATA_GATEWAY_RUNTIME_SCHEMA_VERSION,
    service: "neo-data-gateway",
    status: "ok",
    registrySchemaVersion: NEO_SOURCE_REGISTRY_SCHEMA_VERSION,
    packageVersion: NEO_SOURCE_REGISTRY_PACKAGE_VERSION,
  });
}

export function publicRegistryResponse(request: RuntimeRequest): RuntimeResponse {
  if (request.method.toUpperCase() !== "GET") return response(405, { error: "Method not allowed" }, { allow: "GET" });
  const capability = queryValue(request.query, "capability").trim();
  if (capability && !capabilityExists(capability)) return response(404, { error: "Capability not found" });
  return response(200, {
    schemaVersion: NEO_SOURCE_REGISTRY_SCHEMA_VERSION,
    scope: "shared-public-governance-metadata",
    capabilities: safeCapabilitySnapshot(capability || undefined),
  }, { "access-control-allow-origin": "*" });
}

export async function protectedQueryResponse(request: RuntimeRequest, env: RuntimeEnv, gateway: GatewayRuntime): Promise<RuntimeResponse> {
  if (request.method.toUpperCase() !== "POST") return response(405, { error: "Method not allowed" }, { allow: "POST" });
  const auth = authorizeConsumer(request, env);
  if (!auth.ok) return response(auth.status, { error: auth.status === 503 ? "Gateway authentication is not configured" : "Unauthorized" });
  if (!plainObject(request.body)) return response(400, { error: "JSON object body required" });

  const capability = typeof request.body.capability === "string" ? request.body.capability.trim() : "";
  if (!capability || capability.length > 100 || !capabilityExists(capability)) return response(400, { error: "Valid capability is required" });
  const input = request.body.input === undefined ? {} : request.body.input;
  if (!plainObject(input) || Object.keys(input).length > 40) return response(400, { error: "Input must be a bounded JSON object" });

  const requestedExperimental = request.body.includeExperimental === true;
  const includeExperimental = requestedExperimental && env.NEO_GATEWAY_ALLOW_EXPERIMENTAL === "true";
  if (requestedExperimental && !includeExperimental) return response(403, { error: "Experimental providers are disabled" });

  const requestId = randomUUID();
  const result = await gateway.request(capability, input, { includeExperimental });
  const payload = {
    schemaVersion: NEO_DATA_GATEWAY_RESPONSE_SCHEMA_VERSION,
    requestId,
    consumer: auth.consumer,
    ...result,
  };
  return response(result.ok ? 200 : 503, payload);
}
