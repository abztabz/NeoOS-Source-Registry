# Official provider wave 3

This wave implements two previously governed official providers without changing their approval status.

- MET Norway Locationforecast 2.0: bounded latitude/longitude/altitude input, compact JSON only, identifying User-Agent required through `NEO_MET_USER_AGENT`, normalized forecast observations, maximum 48 time points.
- UK Companies House: public company search only, API key required through `NEO_COMPANIES_HOUSE_KEY`, key sent through HTTP Basic authentication and never placed in URLs or normalized output, maximum 20 results per call.

Implementation does not imply deployment configuration is present. The default adapter registry exposes these providers only when the required server-side configuration exists. Existing Registry governance remains authoritative.
