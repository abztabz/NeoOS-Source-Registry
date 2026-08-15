import type { IncomingMessage, ServerResponse } from "node:http";
import { publicHealthResponse } from "../src/runtime.js";
import { writeRuntimeResponse } from "../src/vercel-http.js";

export const config = { maxDuration: 5 };

export default function handler(_request: IncomingMessage, response: ServerResponse) {
  writeRuntimeResponse(response, publicHealthResponse());
}
