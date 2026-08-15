import type { IncomingMessage, ServerResponse } from "node:http";
import type { RuntimeRequest, RuntimeResponse } from "./runtime.js";

const MAX_BODY_BYTES = 32 * 1024;

type VercelLikeRequest = IncomingMessage & { body?: unknown; query?: Record<string, string | string[] | undefined> };

function enforceDeclaredBodyLimit(request: IncomingMessage): void {
  const raw = request.headers["content-length"];
  const value = Array.isArray(raw) ? raw[0] : raw;
  const length = Number(value ?? 0);
  if (Number.isFinite(length) && length > MAX_BODY_BYTES) throw new Error("REQUEST_BODY_TOO_LARGE");
}

async function readBoundedBody(request: VercelLikeRequest): Promise<unknown> {
  enforceDeclaredBodyLimit(request);
  if (request.body !== undefined) {
    let encoded = "";
    try { encoded = JSON.stringify(request.body); } catch { throw new Error("INVALID_JSON"); }
    if (Buffer.byteLength(encoded, "utf8") > MAX_BODY_BYTES) throw new Error("REQUEST_BODY_TOO_LARGE");
    return request.body;
  }
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += buffer.length;
    if (total > MAX_BODY_BYTES) throw new Error("REQUEST_BODY_TOO_LARGE");
    chunks.push(buffer);
  }
  if (!chunks.length) return undefined;
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) return undefined;
  try { return JSON.parse(raw) as unknown; } catch { throw new Error("INVALID_JSON"); }
}

function headersFromNode(request: IncomingMessage): RuntimeRequest["headers"] {
  return Object.fromEntries(Object.entries(request.headers).map(([key, value]) => [key, value]));
}

function queryFromNode(request: VercelLikeRequest): RuntimeRequest["query"] {
  if (request.query) return request.query;
  const url = new URL(request.url ?? "/", "https://neo-data-gateway.local");
  const query: Record<string, string | string[]> = {};
  for (const [key, value] of url.searchParams.entries()) {
    const previous = query[key];
    query[key] = previous === undefined ? value : Array.isArray(previous) ? [...previous, value] : [previous, value];
  }
  return query;
}

export async function runtimeRequestFromNode(request: VercelLikeRequest, includeBody = false): Promise<RuntimeRequest> {
  const url = new URL(request.url ?? "/", "https://neo-data-gateway.local");
  return {
    method: request.method ?? "GET",
    path: url.pathname,
    headers: headersFromNode(request),
    query: queryFromNode(request),
    body: includeBody ? await readBoundedBody(request) : undefined,
  };
}

export function writeRuntimeResponse(response: ServerResponse, result: RuntimeResponse): void {
  response.statusCode = result.status;
  for (const [key, value] of Object.entries(result.headers)) response.setHeader(key, value);
  response.end(JSON.stringify(result.body));
}

export function writeBridgeError(response: ServerResponse, error: unknown): void {
  const code = error instanceof Error ? error.message : "";
  const status = code === "REQUEST_BODY_TOO_LARGE" ? 413 : code === "INVALID_JSON" ? 400 : 500;
  const message = status === 413 ? "Request body too large" : status === 400 ? "Invalid JSON" : "Internal gateway error";
  response.statusCode = status;
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.setHeader("cache-control", "no-store, max-age=0");
  response.setHeader("x-content-type-options", "nosniff");
  response.end(JSON.stringify({ error: message }));
}
