---
description: Build a Docker image from source and recreate the running container via docker compose
---

# Build Image & Redeploy Container

## When to use

Use after making backend or frontend code changes that require a new Docker image.
Handles the full cycle: build the image locally, then restart only the affected service
without touching other running containers.

## Instructions

### Step 1 — Collect parameters

Read `$ARGUMENTS`. If any required value is missing, ask the user for it before proceeding.

Required parameters:
| Parameter | Description | Example |
|-----------|-------------|---------|
| `source_dir` | Absolute path to the project with the Dockerfile | `d:\Proyectos\MyApp\backend` |
| `image_name` | Image name and tag to build | `myapp-backend:latest` |
| `deploy_dir` | Absolute path to the directory containing `docker-compose.yml` | `d:\Proyectos\MyApp\deploy` |
| `service` | Compose service name to recreate | `backend` |
| `env_file` | Path to the env file (relative to `deploy_dir` or absolute) | `clients/client1.env` |

Do not assume defaults — ask if unclear.

### Step 2 — Verify prerequisites

Before building, confirm:
- `source_dir` exists and contains a `Dockerfile`
- `deploy_dir` contains a `docker-compose.yml`
- `env_file` exists
- The `service` name appears in `docker-compose.yml`

If any check fails, stop and report what is missing.

### Step 3 — Build the image

```bash
docker build -t <image_name> <source_dir>
```

Stream the last 10 lines of build output to confirm success. If the build fails, stop and show the error — do not proceed to Step 4.

### Step 4 — Recreate the container

From `deploy_dir`, run:

```bash
docker compose --env-file <env_file> up -d --force-recreate <service>
```

`--force-recreate` ensures the container picks up the new image even if the compose config did not change. Never recreate all services (`docker compose up` without a service name) — that risks restarting the database unnecessarily.

### Step 5 — Verify

Check the container came up healthy:

```bash
docker compose --env-file <env_file> ps <service>
```

If the service shows as `unhealthy` or `exited`, fetch the last 30 lines of logs and report them:

```bash
docker compose --env-file <env_file> logs --tail=30 <service>
```

## Steps

1. Collect and validate all parameters
2. Verify Dockerfile, docker-compose.yml, and env file exist
3. `docker build -t <image_name> <source_dir>`
4. `docker compose --env-file <env_file> up -d --force-recreate <service>`
5. `docker compose --env-file <env_file> ps <service>` — confirm running

## Output format

Report each step inline as it completes:

```
[1/3] Building image myapp-backend:latest ...  ✓
[2/3] Recreating container backend ...          ✓
[3/3] Container status: running (healthy)       ✓
```

If any step fails, print the error and stop.

## Examples

**`$ARGUMENTS`:**
```
source_dir=d:\Projects\MyApp\backend
image_name=myapp-backend:latest
deploy_dir=d:\Projects\MyApp\deploy
service=backend
env_file=clients/prod.env
```

**Output:**
```
[1/3] Building image myapp-backend:latest ...  ✓ (2m 14s)
[2/3] Recreating container backend ...          ✓
[3/3] Container status: running (healthy)       ✓
```
