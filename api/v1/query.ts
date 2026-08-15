import type { IncomingMessage, ServerResponse } from "node:http";
import { createNeoDataGateway } from "../../src/create-gateway.js";
import { protectedQueryResponse } from "../../src/runtime.js";
import { runtimeRequestFromNode, writeBridgeError, writeRuntimeResponse } from "../../src/vercel-http.js";

export const config = { maxDuration: 15 };

const gateway = createNeoDataGateway(process.env);

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  try {
    const runtimeRequest = await runtimeRequestFromNode(request, true);
    const result = await protectedQueryResponse(runtimeRequest, process.env, gateway);
    writeRuntimeResponse(response, result);
  } catch (error) {
    writeBridgeError(response, error);
  }
}
