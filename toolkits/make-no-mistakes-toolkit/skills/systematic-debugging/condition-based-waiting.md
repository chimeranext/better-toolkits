# Condition-Based Waiting

Replace arbitrary timeouts (`sleep 3`, `sleep 5`) with condition polling in automated tests.

Instead of fixed delays, poll until a condition is met (e.g., file exists, process output appears, server responds) with a maximum timeout. This reduces flakiness and speeds up tests that complete faster than the fixed delay.

Example pattern (bash):
```bash
poll_condition() {
  local max_wait=${1:-60}
  local interval=${2:-2}
  local elapsed=0
  while [ $elapsed -lt $max_wait ]; do
    if [ -f "$file" ]; then return 0; fi
    sleep $interval
    elapsed=$((elapsed + interval))
  done
  return 1
}
```
