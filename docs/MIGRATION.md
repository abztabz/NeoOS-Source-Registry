# NeoContent extraction migration

The standalone repository is the canonical governance owner. NeoContent currently retains a compatibility copy of the gateway runtime to avoid breaking its live Vercel deployment.

Cutover is deliberately staged:

1. establish standalone registry, capability contract, gateway and live adapters;
2. verify standalone CI;
3. mark NeoContent's copy as vendored compatibility code;
4. choose a stable consumption mechanism (versioned package or deployed gateway service);
5. switch NeoContent to the shared interface and verify preview/production;
6. remove the vendored shared governance code from NeoContent.

No big-bang deletion is permitted. Production continuity takes precedence over repository tidiness.

Until step 5, new shared provider governance changes must originate here and be synchronized to the compatibility copy only when NeoContent needs them.
