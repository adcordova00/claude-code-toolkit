---
description: Design a complete alerting strategy for a service based on its SLOs and dependencies.
---

# Design Alerting Strategy

## When to use

Use when setting up monitoring for a new service or auditing gaps in an existing alert setup.
Pass the service description (tech stack, dependencies, SLOs) in `$ARGUMENTS`.

## Instructions

Design an alerting strategy following SRE principles: alert on symptoms, not causes. Every
alert should be actionable — if a human doesn't need to do something specific, it shouldn't page.

**The four golden signals (cover all four)**

1. **Latency** — how long requests take (distinguish slow failures from fast ones)
   - p50, p95, p99 — alert on p99, watch p95, graph p50
   - Separate read vs. write latency if they have different SLOs

2. **Traffic** — how many requests/operations per second
   - Alert on sudden drops (could mean requests not reaching the service)
   - Alert on anomalies during expected traffic patterns

3. **Errors** — rate of failed requests (HTTP 5xx, exceptions, failed jobs)
   - Alert when error rate > X% of traffic for Y minutes
   - Separate user errors (4xx) from server errors (5xx)

4. **Saturation** — how full the service is (CPU, memory, DB connections, queue depth)
   - Alert before hitting limits, not after

**Alert levels**
- **Page (P1)**: requires immediate action, user-impacting, wakes someone up
  - Service down / error rate > 1% for 5 min / p99 latency 3x SLO
- **Ticket (P2)**: requires action within the day, not user-impacting yet
  - Approaching saturation limits / slow degradation trends
- **Info**: for dashboards only, no notification

**Service-specific signals (from $ARGUMENTS)**
- For HTTP APIs: request rate, error rate, latency by endpoint
- For background jobs: job duration, failure rate, queue depth, last successful run
- For databases: connection pool usage, query latency, replication lag
- For caches: hit rate, eviction rate, memory usage

**Avoid alert fatigue**
- Each alert must have a clear runbook or response action
- Warning threshold should fire before the critical threshold — gives time to react
- Use anomaly detection for metrics with cyclical patterns (don't hardcode weekend thresholds)
- Combine related alerts into a single composite alert where possible

## Steps

1. Parse `$ARGUMENTS` for: service type, dependencies, SLO targets
2. Design alerts for all four golden signals
3. Add service-specific alerts based on the tech stack
4. For each alert: specify metric, threshold, window, severity, and response action

## Output format

```
## Alerting Strategy: <Service Name>

### SLO Targets
- Availability: X%
- Latency p99: Xms

### Alerts

| Signal | Metric | Condition | Window | Severity | Action |
|--------|--------|-----------|--------|----------|--------|
| Error rate | http.server.errors / http.server.requests | > 1% | 5 min | P1 Page | Check logs, recent deploy |
| ...

### Missing coverage
- [signals not covered]

### Recommended dashboards to create alongside these alerts
- [dashboard suggestions]
```
