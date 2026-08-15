import type { IncomingMessage, ServerResponse } from "node:http";
import { publicRegistryResponse } from "../../src/runtime.js";
import { runtimeRequestFromNode, writeBridgeError, writeRuntimeResponse } from "../../src/vercel-http.js";

export const config = { maxDuration: 5 };

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  try {
    const runtimeRequest = await runtimeRequestFromNode(request);
    writeRuntimeResponse(response, publicRegistryResponse(runtimeRequest));
  } catch (error) {
    writeBridgeError(response, error);
  }
}
