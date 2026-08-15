# Cutover guard

Do not delete NeoContent's current gateway files merely because this repository exists. First establish a versioned consumption path, run NeoContent checks/tests, obtain a green preview deployment, verify registry behavior, then merge and verify production. Only then remove the compatibility copy in a separate change.
