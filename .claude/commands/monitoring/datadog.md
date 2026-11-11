---
description: Generate a Datadog monitor definition from an SLO description or alert requirement.
---

# Generate Datadog Monitor

## When to use

Use when creating a new Datadog monitor for a service, endpoint, or business metric. Pass the
SLO description or alert requirement in `$ARGUMENTS` (e.g., "alert if p99 latency > 2s on /api/orders
for 5 consecutive minutes, page the on-call team").

## Instructions

Generate a Datadog monitor definition in JSON (compatible with Datadog API and Terraform `datadog_monitor`).

**Monitor types by use case**
- Endpoint latency/errors → `metric alert` on `trace.http.request.duration` or `http.server.request.duration`
- Error rate → `metric alert` on `trace.http.request.errors / trace.http.request.hits`
- Service availability → `service check` or `synthetics` (prefer synthetics for user-facing)
- Log-based → `log alert` with log query
- Business metric (orders/min drops) → `metric alert` with anomaly or threshold

**Alert quality principles**
- Evaluate period: short enough to catch problems fast, long enough to avoid flapping
  (5 minutes is a good default for latency/errors; use `as_rate()` for rate metrics)
- Threshold: set based on SLO — if SLO is 99.9% availability, alert at < 99.95% to have a buffer
- Warning threshold: ~80% of the critical threshold (gives time to react before paging)
- Recovery threshold: slightly below the critical threshold to prevent oscillation
- `require_full_window: false` for new monitors — don't wait for a full evaluation window
- Tags: always include `env`, `service`, `team` for routing and filtering
- Notification message: include runbook link, dashboard link, and affected service context

**Notification routing**
- `@pagerduty-<service>` for pages
- `@slack-<channel>` for warnings
- `{{#is_alert}}` / `{{#is_recovery}}` conditionals in the message

## Steps

1. Parse `$ARGUMENTS` for: metric type, threshold, evaluation period, notification target
2. Generate the monitor JSON
3. Show the equivalent Terraform `datadog_monitor` resource
4. Suggest related monitors to pair with this one

## Output format

```json
// Datadog API JSON
{
  "name": "...",
  "type": "metric alert",
  "query": "...",
  "message": "...",
  "thresholds": { ... },
  "tags": [ ... ]
}
```

```hcl
# Terraform
resource "datadog_monitor" "..." {
  ...
}
```

Then: suggested complementary monitors to create alongside this one.
