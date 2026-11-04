# Root Cause Tracing

Trace bugs backward through call stacks to find the original trigger.

When investigating a multi-layer system failure (e.g., CI → build → signing; API → service → database):

1. Identify the exact layer where the failure occurs.
2. Log input/output at each layer boundary.
3. Trace upward until you find the source of the bad value or broken assumption.
4. Fix at the source, not at the symptom layer.
