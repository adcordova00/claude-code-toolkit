---
description: Review a Dockerfile for security, image size, and build efficiency best practices.
---

# Review Dockerfile

## When to use

Use when writing a new Dockerfile or auditing an existing one. Pass the Dockerfile content or
path in `$ARGUMENTS`. Covers both application images and CI/tooling images.

## Instructions

Review the Dockerfile for these concerns:

**Security**
- Running as root (no `USER` instruction at the end) — processes running as root in a container
  can escape to the host with certain kernel vulnerabilities
- `COPY . .` before installing dependencies — invalidates cache on every code change AND copies
  `.env`, secrets, `.git` into the image (use `.dockerignore`)
- Missing `.dockerignore` — flag that it must exist alongside the Dockerfile
- `ADD` used instead of `COPY` (ADD has implicit tar extraction and URL fetching — surprising)
- Secrets passed as `ARG` or `ENV` (visible in `docker history`) — use BuildKit secret mounts instead
- Using `latest` tag for base images — non-deterministic, builds can break silently

**Image size**
- Full OS image when distroless or alpine is sufficient
- Build tools left in the final image — use multi-stage builds to separate build and runtime stages
- Package manager caches not cleaned in the same `RUN` layer:
  `apt-get install -y curl && rm -rf /var/lib/apt/lists/*`
- Multiple `RUN` commands that could be chained (each `RUN` creates a layer)

**Build efficiency (cache optimization)**
- `COPY . .` before `RUN npm install` / `COPY pom.xml` — code changes invalidate the dependency cache
  - Correct order: copy dependency manifest → install → copy source → build
- `RUN npm install` instead of `RUN npm ci` (non-deterministic in CI)

**Multi-stage build pattern for JVM apps**
```dockerfile
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app
COPY mvnw pom.xml ./
COPY .mvn .mvn
RUN ./mvnw dependency:go-offline -q
COPY src ./src
RUN ./mvnw package -DskipTests -q

FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S app && adduser -S app -G app
USER app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**For Node/React**
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

## Steps

1. Read the full Dockerfile
2. Check: base image, layer ordering, multi-stage usage, USER instruction, secrets handling
3. Generate the improved Dockerfile with inline comments on key changes

## Output format

Issues list first, then the corrected Dockerfile:

```
## Dockerfile Review

### Critical (security)
### Major (correctness/size)
### Minor (efficiency)

## Improved Dockerfile
```dockerfile
...
```
