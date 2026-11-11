---
description: Review Spring Boot Actuator configuration for security and observability completeness.
---

# Review Spring Boot Actuator Configuration

## When to use

Use when setting up or auditing Actuator in a Spring Boot application. Pass the
`application.yml`/`application.properties` or the security configuration in `$ARGUMENTS`.

## Instructions

Review Actuator configuration against these criteria:

**Security (most important)**
- Actuator endpoints exposed publicly without authentication — `/actuator/env`, `/actuator/beans`,
  `/actuator/heapdump`, `/actuator/threaddump` expose sensitive information
- Recommended: expose only `health` and `info` publicly; protect all others behind a role
- Separate management port if possible: `management.server.port=8081` (blocked at load balancer)

**Correct exposure configuration**
```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus  # explicit allowlist, never '*' in prod
      base-path: /actuator
  endpoint:
    health:
      show-details: when-authorized   # never 'always' in prod
      probes:
        enabled: true                 # enables /health/liveness and /health/readiness
  server:
    port: 8081                        # separate port, firewall at LB level
```

**Health indicators**
- Are all critical dependencies included in health checks? (DB, Redis, external APIs)
- Custom health indicators for business-critical dependencies (payment gateway, etc.)
- `livenessState` and `readinessState` configured for Kubernetes deployments
  - Liveness: is the app alive? (if no, k8s restarts it)
  - Readiness: is the app ready for traffic? (if no, k8s removes it from load balancer)

**Metrics and observability**
- Micrometer with Prometheus: `management.endpoints.web.exposure.include` includes `prometheus`
- Custom metrics for business KPIs (orders processed, payment failures, etc.)
- `management.metrics.tags.application` and `management.metrics.tags.environment` set for filtering

**Info endpoint**
- `management.info.git.mode=full` for deployments — shows git commit in health page
- `management.info.env.enabled=true` with `info.*` properties for version info

## Steps

1. Read the Actuator configuration from `$ARGUMENTS`
2. Check: what's exposed, how it's secured, which health indicators are present
3. Generate the corrected configuration

## Output format

```
## Actuator Configuration Review

### Security issues
- [issue]: [why it's a risk]. Fix: [corrected YAML]

### Missing health indicators
- [dependency] not checked. Add: [code/config]

### Missing metrics
- [suggestion]

## Recommended configuration
```yaml
management:
  ...
```
