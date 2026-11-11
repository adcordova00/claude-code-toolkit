#!/usr/bin/env bash
# add-integration.sh — Add or update integrations in an existing .env
# Run with: bash scripts/add-integration.sh
# Requires: Git Bash (Windows), bash (macOS/Linux)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT/.env"

# ── Colors ────────────────────────────────────────────────────────────────────
BOLD="\033[1m"
DIM="\033[2m"
GREEN="\033[32m"
CYAN="\033[36m"
YELLOW="\033[33m"
RED="\033[31m"
RESET="\033[0m"

# ── Helpers ───────────────────────────────────────────────────────────────────

print_header() {
  echo ""
  echo -e "${BOLD}${CYAN}╔══════════════════════════════════════════════════╗${RESET}"
  echo -e "${BOLD}${CYAN}║  claude-code-toolkit — Add Integration to .env   ║${RESET}"
  echo -e "${BOLD}${CYAN}╚══════════════════════════════════════════════════╝${RESET}"
  echo ""
}

# Read current value of a var from .env (empty string if not set)
current_val() {
  local key="$1"
  grep -m1 "^${key}=" "$ENV_FILE" 2>/dev/null | cut -d'=' -f2- | tr -d '"' || true
}

# Upsert a key=value in .env: replace the line if key exists, append if not.
upsert_var() {
  local key="$1"
  local value="$2"
  local tmp
  tmp=$(mktemp)

  if grep -q "^${key}=" "$ENV_FILE" 2>/dev/null; then
    while IFS= read -r line; do
      if [[ "$line" =~ ^${key}= ]]; then
        echo "${key}=\"${value}\""
      else
        echo "$line"
      fi
    done < "$ENV_FILE" > "$tmp"
    mv "$tmp" "$ENV_FILE"
    echo -e "  ${GREEN}↺${RESET}  Updated ${CYAN}${key}${RESET}"
  else
    echo "${key}=\"${value}\"" >> "$ENV_FILE"
    echo -e "  ${GREEN}+${RESET}  Added   ${CYAN}${key}${RESET}"
  fi
}

prompt_var() {
  local var_name="$1"
  local prompt_text="$2"
  local default_val="$3"
  local is_secret="${4:-false}"
  local current
  current=$(current_val "$var_name")

  # Show current masked value or supplied default as hint
  local hint=""
  if [[ -n "$current" && "$is_secret" == "true" ]]; then
    hint="${current:0:4}****"
  elif [[ -n "$current" ]]; then
    hint="$current"
  elif [[ -n "$default_val" ]]; then
    hint="$default_val"
  fi

  if [[ -n "$hint" ]]; then
    echo -ne "  ${prompt_text} ${DIM}[${hint}]${RESET}: "
  else
    echo -ne "  ${prompt_text}: "
  fi

  local value=""
  if [[ "$is_secret" == "true" ]]; then
    read -rs value
    echo ""
  else
    read -r value
  fi

  # Keep current value if user presses enter with no input
  if [[ -z "$value" ]]; then
    if [[ -n "$current" ]]; then
      value="$current"
    elif [[ -n "$default_val" ]]; then
      value="$default_val"
    fi
  fi

  echo "$value"
}

# ── Integration prompts ───────────────────────────────────────────────────────

do_github() {
  echo -e "\n${BOLD}GitHub MCP${RESET} ${DIM}(Docker: ghcr.io/github/github-mcp-server)${RESET}"
  echo -e "  ${DIM}Create a token at: github.com/settings/tokens (needs repo + read:org)${RESET}"
  local token
  token=$(prompt_var "GITHUB_TOKEN" "Personal access token (ghp_...)" "" "true")
  [[ -n "$token" ]] && upsert_var "GITHUB_TOKEN" "$token"
}

do_postgresql() {
  echo -e "\n${BOLD}PostgreSQL MCP${RESET}"
  local url
  url=$(prompt_var "POSTGRES_URL" "Connection URL" "postgresql://user:password@localhost:5432/dbname")
  [[ -n "$url" ]] && upsert_var "POSTGRES_URL" "$url"
}

do_redis() {
  echo -e "\n${BOLD}Redis MCP${RESET}"
  local host port pass
  host=$(prompt_var "REDIS_HOST" "Host" "localhost")
  port=$(prompt_var "REDIS_PORT" "Port" "6379")
  pass=$(prompt_var "REDIS_PASSWORD" "Password (leave empty if none)" "" "true")
  [[ -n "$host" ]] && upsert_var "REDIS_HOST" "$host"
  [[ -n "$port" ]] && upsert_var "REDIS_PORT" "$port"
  upsert_var "REDIS_PASSWORD" "$pass"
}

do_datadog() {
  echo -e "\n${BOLD}Datadog custom MCP${RESET}"
  echo -e "  ${DIM}API key and App key from: app.datadoghq.com/organization-settings/api-keys${RESET}"
  local api_key app_key site
  api_key=$(prompt_var "DD_API_KEY" "API key" "" "true")
  app_key=$(prompt_var "DD_APP_KEY" "Application key" "" "true")
  site=$(prompt_var "DD_SITE" "Site" "datadoghq.com")
  [[ -n "$api_key" ]] && upsert_var "DD_API_KEY" "$api_key"
  [[ -n "$app_key" ]] && upsert_var "DD_APP_KEY" "$app_key"
  [[ -n "$site" ]]    && upsert_var "DD_SITE" "$site"
}

do_agents() {
  echo -e "\n${BOLD}Playwright Agents${RESET} ${DIM}(e2e-staging, site-monitor, workflow-automator)${RESET}"
  local staging monitored slack
  staging=$(prompt_var "STAGING_URL" "Staging URL" "https://staging.yourapp.com")
  monitored=$(prompt_var "MONITORED_URLS" "Monitored URLs (comma-separated)" "https://yourapp.com")
  slack=$(prompt_var "SLACK_WEBHOOK_URL" "Slack webhook URL (leave empty to skip)" "")
  [[ -n "$staging" ]]   && upsert_var "STAGING_URL" "$staging"
  [[ -n "$monitored" ]] && upsert_var "MONITORED_URLS" "$monitored"
  upsert_var "SLACK_WEBHOOK_URL" "$slack"
}

do_google() {
  echo -e "\n${BOLD}Google Drive & Docs MCP${RESET} ${DIM}(npx @modelcontextprotocol/server-gdrive)${RESET}"
  echo ""
  echo -e "  ${BOLD}Setup steps (one-time):${RESET}"
  echo -e "  ${CYAN}1.${RESET} Go to: ${DIM}console.cloud.google.com${RESET}"
  echo -e "  ${CYAN}2.${RESET} Create a project (or select existing)"
  echo -e "  ${CYAN}3.${RESET} Enable APIs: ${DIM}APIs & Services → Library${RESET}"
  echo -e "       → Google Drive API  ✓"
  echo -e "       → Google Docs API   ✓"
  echo -e "  ${CYAN}4.${RESET} Create credentials: ${DIM}APIs & Services → Credentials${RESET}"
  echo -e "       → Create Credentials → OAuth 2.0 Client ID"
  echo -e "       → Application type: ${BOLD}Desktop app${RESET}"
  echo -e "       → Download the JSON file"
  echo -e "  ${CYAN}5.${RESET} Place the downloaded file at the path you'll enter below"
  echo -e "  ${DIM}  (On first MCP run, a browser window will open to complete OAuth)${RESET}"
  echo ""

  local creds_path
  creds_path=$(prompt_var "GOOGLE_CREDENTIALS_PATH" "Path to credentials.json" ".credentials/google.json")

  if [[ -n "$creds_path" ]]; then
    # Create the credentials directory if it doesn't exist
    local creds_dir
    creds_dir=$(dirname "$ROOT/$creds_path")
    mkdir -p "$creds_dir"

    upsert_var "GOOGLE_CREDENTIALS_PATH" "$creds_path"

    # Check if the file actually exists yet
    if [[ ! -f "$ROOT/$creds_path" ]]; then
      echo ""
      echo -e "  ${YELLOW}⚠${RESET}  ${BOLD}$creds_path${RESET} does not exist yet."
      echo -e "  ${DIM}Download credentials.json from Google Cloud Console and place it there.${RESET}"
      echo -e "  ${DIM}Directory created: $(dirname "$ROOT/$creds_path")/${RESET}"
    else
      echo -e "  ${GREEN}✓${RESET}  credentials.json found at $creds_path"
    fi
  fi
}

# ── Integration menu ──────────────────────────────────────────────────────────

INTEGRATIONS=(
  "github:GitHub MCP             — read repos, issues, PRs via Claude"
  "google:Google Drive & Docs    — crear y editar Google Docs desde Claude"
  "postgresql:PostgreSQL MCP     — query databases from Claude"
  "redis:Redis MCP               — inspect cache keys from Claude"
  "datadog:Datadog custom MCP    — monitors, metrics, logs, incidents"
  "agents:Playwright Agents      — e2e-staging, site-monitor, automator"
)

show_menu() {
  echo -e "${BOLD}Which integration do you want to add or update?${RESET}"
  echo -e "${DIM}Enter numbers separated by spaces, or 'all' for everything${RESET}\n"
  local i=1
  for entry in "${INTEGRATIONS[@]}"; do
    local id="${entry%%:*}"
    local label="${entry#*:}"
    local current_mark=""
    # Check if any var for this integration is already in .env
    case "$id" in
      github)     grep -q "^GITHUB_TOKEN=" "$ENV_FILE" 2>/dev/null && current_mark=" ${GREEN}✓${RESET}" || true ;;
      google)     grep -q "^GOOGLE_CREDENTIALS_PATH=" "$ENV_FILE" 2>/dev/null && current_mark=" ${GREEN}✓${RESET}" || true ;;
      postgresql) grep -q "^POSTGRES_URL=" "$ENV_FILE" 2>/dev/null && current_mark=" ${GREEN}✓${RESET}" || true ;;
      redis)      grep -q "^REDIS_HOST=" "$ENV_FILE" 2>/dev/null && current_mark=" ${GREEN}✓${RESET}" || true ;;
      datadog)    grep -q "^DD_API_KEY=" "$ENV_FILE" 2>/dev/null && current_mark=" ${GREEN}✓${RESET}" || true ;;
      agents)     grep -q "^STAGING_URL=" "$ENV_FILE" 2>/dev/null && current_mark=" ${GREEN}✓${RESET}" || true ;;
    esac
    printf "  ${CYAN}%d)${RESET} %-52s%b\n" "$i" "$label" "$current_mark"
    ((i++))
  done
  echo -e "  ${CYAN}a)${RESET} all\n"
  echo -ne "${BOLD}Your choice${RESET}: "
}

get_selected_ids() {
  local input="$1"
  local selected=()

  if [[ "$input" == "a" || "$input" == "all" ]]; then
    for entry in "${INTEGRATIONS[@]}"; do
      selected+=("${entry%%:*}")
    done
  else
    for token in $input; do
      if [[ "$token" =~ ^[0-9]+$ ]]; then
        local idx=$(( token - 1 ))
        if [[ $idx -ge 0 && $idx -lt ${#INTEGRATIONS[@]} ]]; then
          selected+=("${INTEGRATIONS[$idx]%%:*}")
        else
          echo -e "${RED}  ⚠  Unknown option: $token — skipped${RESET}" >&2
        fi
      fi
    done
  fi

  echo "${selected[@]}"
}

# ── Main ──────────────────────────────────────────────────────────────────────

print_header

# Create .env if it doesn't exist yet
if [[ ! -f "$ENV_FILE" ]]; then
  echo -e "${YELLOW}⚠  .env not found — creating it now.${RESET}"
  echo -e "${DIM}  (Run bash scripts/setup.sh for a full guided setup)${RESET}\n"
  cat > "$ENV_FILE" <<'HEADER'
# .env — claude-code-toolkit environment variables
# DO NOT commit this file
HEADER
fi

show_menu
read -r selection
selected_ids=($(get_selected_ids "$selection"))

if [[ ${#selected_ids[@]} -eq 0 ]]; then
  echo -e "\n${RED}No integrations selected. Aborting.${RESET}\n"
  exit 1
fi

echo ""

for id in "${selected_ids[@]}"; do
  case "$id" in
    github)     do_github ;;
    google)     do_google ;;
    postgresql) do_postgresql ;;
    redis)      do_redis ;;
    datadog)    do_datadog ;;
    agents)     do_agents ;;
  esac
done

echo ""
echo -e "${GREEN}✅ .env updated:${RESET} $ENV_FILE"
echo -e "${DIM}   Reload Claude Code to apply MCP changes.${RESET}"
echo ""
