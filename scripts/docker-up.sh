#!/usr/bin/env bash
# docker-up.sh — Pull MCP Docker images and build the custom Datadog MCP
# Run with: bash scripts/docker-up.sh
# Requires: Docker, Node.js 18+, Git Bash (Windows) or bash (macOS/Linux)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DATADOG_MCP_DIR="$ROOT/mcp/datadog"

# ── Colors ────────────────────────────────────────────────────────────────────
BOLD="\033[1m"
DIM="\033[2m"
GREEN="\033[32m"
CYAN="\033[36m"
YELLOW="\033[33m"
RED="\033[31m"
RESET="\033[0m"

# ── Helpers ───────────────────────────────────────────────────────────────────

step() { echo -e "\n${BOLD}${CYAN}▶${RESET} ${BOLD}$1${RESET}"; }
ok()   { echo -e "  ${GREEN}✓${RESET}  $1"; }
warn() { echo -e "  ${YELLOW}⚠${RESET}  $1"; }
fail() { echo -e "  ${RED}✗${RESET}  $1"; }

print_header() {
  echo ""
  echo -e "${BOLD}${CYAN}╔══════════════════════════════════════════════════╗${RESET}"
  echo -e "${BOLD}${CYAN}║      claude-code-toolkit — MCP Docker Setup      ║${RESET}"
  echo -e "${BOLD}${CYAN}╚══════════════════════════════════════════════════╝${RESET}"
  echo ""
}

# ── Checks ────────────────────────────────────────────────────────────────────

check_docker() {
  step "Checking Docker"
  if ! command -v docker &>/dev/null; then
    fail "Docker not found. Install Docker Desktop: https://docs.docker.com/get-docker/"
    exit 1
  fi
  if ! docker info &>/dev/null; then
    fail "Docker daemon is not running. Start Docker Desktop and retry."
    exit 1
  fi
  local version
  version=$(docker --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
  ok "Docker $version is running"
}

check_node() {
  step "Checking Node.js"
  if ! command -v node &>/dev/null; then
    fail "Node.js not found. Install from: https://nodejs.org"
    exit 1
  fi
  local version
  version=$(node --version)
  ok "Node.js $version"
}

# ── Docker images ─────────────────────────────────────────────────────────────

pull_github_mcp() {
  step "Pulling GitHub MCP image"
  echo -e "  ${DIM}ghcr.io/github/github-mcp-server${RESET}"

  if docker pull ghcr.io/github/github-mcp-server 2>&1 | tail -1 | grep -q "Status: Image is up to date"; then
    ok "Already up to date"
  else
    ok "Pulled successfully"
  fi
}

# ── Datadog custom MCP ────────────────────────────────────────────────────────

build_datadog_mcp() {
  step "Building Datadog custom MCP"
  echo -e "  ${DIM}$DATADOG_MCP_DIR${RESET}"

  if [[ ! -d "$DATADOG_MCP_DIR" ]]; then
    fail "Directory not found: $DATADOG_MCP_DIR"
    echo -e "  ${DIM}Has the repository been cloned completely?${RESET}"
    exit 1
  fi

  if [[ ! -f "$DATADOG_MCP_DIR/package.json" ]]; then
    fail "package.json not found in mcp/datadog/"
    exit 1
  fi

  echo -e "  ${DIM}npm install...${RESET}"
  (cd "$DATADOG_MCP_DIR" && npm install --silent)
  ok "Dependencies installed"

  echo -e "  ${DIM}npm run build...${RESET}"
  (cd "$DATADOG_MCP_DIR" && npm run build)

  local dist="$DATADOG_MCP_DIR/dist/index.js"
  if [[ -f "$dist" ]]; then
    ok "Built: mcp/datadog/dist/index.js"
  else
    fail "Build completed but dist/index.js not found — check tsconfig.json"
    exit 1
  fi
}

# ── .env check ────────────────────────────────────────────────────────────────

check_env_vars() {
  step "Checking required environment variables"

  local env_file="$ROOT/.env"
  if [[ -f "$env_file" ]]; then
    # shellcheck disable=SC1090
    set -a; source "$env_file"; set +a
  fi

  local missing=()

  # GitHub MCP
  [[ -z "${GITHUB_TOKEN:-}" ]] && missing+=("GITHUB_TOKEN  (GitHub MCP)")

  # Google Drive MCP
  if [[ -z "${GOOGLE_CREDENTIALS_PATH:-}" ]]; then
    missing+=("GOOGLE_CREDENTIALS_PATH  (Google Drive MCP)")
  elif [[ ! -f "$ROOT/${GOOGLE_CREDENTIALS_PATH}" ]]; then
    warn "GOOGLE_CREDENTIALS_PATH set but file not found: ${GOOGLE_CREDENTIALS_PATH}"
    echo -e "    ${DIM}Download credentials.json from Google Cloud Console and place it there.${RESET}"
  else
    ok "Google credentials found: ${GOOGLE_CREDENTIALS_PATH}"
  fi

  # Datadog MCP
  [[ -z "${DD_API_KEY:-}" ]]  && missing+=("DD_API_KEY   (Datadog MCP)")
  [[ -z "${DD_APP_KEY:-}" ]]  && missing+=("DD_APP_KEY   (Datadog MCP)")

  # Anthropic SDK
  [[ -z "${ANTHROPIC_API_KEY:-}" ]] && missing+=("ANTHROPIC_API_KEY  (npm run new-skill)")

  if [[ ${#missing[@]} -eq 0 ]]; then
    ok "All required vars are set"
  else
    warn "Missing variables — some MCPs won't connect until you add them:"
    for v in "${missing[@]}"; do
      echo -e "    ${DIM}• $v${RESET}"
    done
    echo -e "  ${DIM}Run: bash scripts/add-integration.sh${RESET}"
  fi
}

# ── Summary ───────────────────────────────────────────────────────────────────

print_summary() {
  echo ""
  echo -e "${GREEN}${BOLD}✅ MCP setup complete${RESET}"
  echo ""
  echo -e "${BOLD}What Claude Code will use:${RESET}"
  echo -e "  ${CYAN}github${RESET}      → Docker: ghcr.io/github/github-mcp-server"
  echo -e "  ${CYAN}playwright${RESET}  → npx @playwright/mcp@latest              ${DIM}(auto-downloaded)${RESET}"
  echo -e "  ${CYAN}postgresql${RESET}  → npx @modelcontextprotocol/server-postgres ${DIM}(auto-downloaded)${RESET}"
  echo -e "  ${CYAN}redis${RESET}       → npx mcp-redis                            ${DIM}(auto-downloaded)${RESET}"
  echo -e "  ${CYAN}filesystem${RESET}  → npx @modelcontextprotocol/server-filesystem ${DIM}(auto-downloaded)${RESET}"
  echo -e "  ${CYAN}fetch${RESET}       → npx @modelcontextprotocol/server-fetch    ${DIM}(auto-downloaded)${RESET}"
  echo -e "  ${CYAN}drawio${RESET}       → npx @drawio/mcp                           ${DIM}(auto-downloaded)${RESET}"
  echo -e "  ${CYAN}google-drive${RESET} → npx @modelcontextprotocol/server-gdrive   ${DIM}(needs .credentials/google.json)${RESET}"
  echo -e "  ${CYAN}datadog${RESET}     → node mcp/datadog/dist/index.js            ${DIM}(just built)${RESET}"
  echo ""
  echo -e "${DIM}Reload Claude Code (Ctrl+Shift+P → 'Claude: Restart') to connect all MCPs.${RESET}"
  echo ""
}

# ── Main ──────────────────────────────────────────────────────────────────────

print_header
check_docker
check_node
pull_github_mcp
build_datadog_mcp
check_env_vars
print_summary
