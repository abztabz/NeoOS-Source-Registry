import assert from "node:assert/strict";
import test from "node:test";
import { sourceRegistry } from "./registry.js";

test("provider catalogue contains no customer-specific identifiers",()=>{const json=JSON.stringify(sourceRegistry).toLowerCase();for(const forbidden of ["top entertainment nepal","108media.ae","site_id","customer_id"])assert.equal(json.includes(forbidden),false,forbidden);});
