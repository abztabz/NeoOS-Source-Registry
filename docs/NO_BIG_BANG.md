# No big-bang migrations

Shared infrastructure should be extracted behind compatibility boundaries. A consumer's working production implementation is not deleted until the replacement path has independent tests and a verified consumer deployment. This rule applies to future NeoOS shared-service extractions as well.
