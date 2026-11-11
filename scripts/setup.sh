#!/usr/bin/env bash
# setup.sh — First-time .env setup for claude-code-toolkit
# Run with: bash scripts/setup.sh
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
  echo -e "${BOLD}${CYAN}║     claude-code-toolkit — Environment Setup      ║${RESET}"
  echo -e "${BOLD}${CYAN}╚══════════════════════════════════════════════════╝${RESET}"
  echo ""
}

prompt_var() {
  local var_name="$1"
  local prompt_text="$2"
  local default_val="${3:-}"
  local is_secret="${4:-false}"
  local value=""

  if [[ -n "$default_val" ]]; then
    echo -ne "  ${prompt_text} ${DIM}[${default_val}]${RESET}: "
  else
    echo -ne "  ${prompt_text}: "
  fi

  if [[ "$is_secret" == "true" ]]; then
    read -rs value
    echo ""
  else
    read -r value
  fi

  if [[ -z "$value" && -n "$default_val" ]]; then
    value="$default_val"
  fi

  # Shellcheck disable: intentional indirect assignment via eval
  # We export into an associative array instead
  echo "$value"
}

write_section() {
  local comment="$1"
  local -n vars_ref=$2
  local -n vals_ref=$3

  echo "" >> "$ENV_FILE"
  echo "# $comment" >> "$ENV_FILE"
  for i in "${!vars_ref[@]}"; do
    local key="${vars_ref[$i]}"
    local val="${vals_ref[$i]}"
    echo "${key}=\"${val}\"" >> "$ENV_FILE"
  done
}

# ── Integration prompts ───────────────────────────────────────────────────────

prompt_github() {
  echo -e "\n${BOLD}GitHub MCP${RESET} ${DIM}(Docker: ghcr.io/github/github-mcp-server)${RESET}"
  echo -e "  ${DIM}Create a token at: github.com/settings/tokens (needs repo + read:org)${RESET}"
  local token
  token=$(prompt_var "GITHUB_TOKEN" "Personal access token (ghp_...)" "" "true")
  GITHUB_SECTION_VARS=("GITHUB_TOKEN")
  GITHUB_SECTION_VALS=("$token")
  write_section "GitHub MCP" GITHUB_SECTION_VARS GITHUB_SECTION_VALS
}

prompt_postgresql() {
  echo -e "\n${BOLD}PostgreSQL MCP${RESET}"
  local url
  url=$(prompt_var "POSTGRES_URL" "Connection URL" "postgresql://user:password@localhost:5432/dbname")
  POSTGRES_SECTION_VARS=("POSTGRES_URL")
  POSTGRES_SECTION_VALS=("$url")
  write_section "PostgreSQL MCP" POSTGRES_SECTION_VARS POSTGRES_SECTION_VALS
}

prompt_redis() {
  echo -e "\n${BOLD}Redis MCP${RESET}"
  local host port pass
  host=$(prompt_var "REDIS_HOST" "Host" "localhost")
  port=$(prompt_var "REDIS_PORT" "Port" "6379")
  pass=$(prompt_var "REDIS_PASSWORD" "Password (leave empty if none)" "" "true")
  REDIS_SECTION_VARS=("REDIS_HOST" "REDIS_PORT" "REDIS_PASSWORD")
  REDIS_SECTION_VALS=("$host" "$port" "$pass")
  write_section "Redis MCP" REDIS_SECTION_VARS REDIS_SECTION_VALS
}

prompt_datadog() {
  echo -e "\n${BOLD}Datadog custom MCP${RESET} ${DIM}(requires: npm run docker-up)${RESET}"
  echo -e "  ${DIM}API key and App key from: app.datadoghq.com/organization-settings/api-keys${RESET}"
  local api_key app_key site
  api_key=$(prompt_var "DD_API_KEY" "API key" "" "true")
  app_key=$(prompt_var "DD_APP_KEY" "Application key" "" "true")
  site=$(prompt_var "DD_SITE" "Site" "datadoghq.com")
  DD_SECTION_VARS=("DD_API_KEY" "DD_APP_KEY" "DD_SITE")
  DD_SECTION_VALS=("$api_key" "$app_key" "$site")
  write_section "Datadog custom MCP" DD_SECTION_VARS DD_SECTION_VALS
}

prompt_agents() {
  echo -e "\n${BOLD}Playwright Agents${RESET} ${DIM}(e2e-staging, site-monitor, workflow-automator)${RESET}"
  local staging monitored slack
  staging=$(prompt_var "STAGING_URL" "Staging URL" "https://staging.yourapp.com")
  monitored=$(prompt_var "MONITORED_URLS" "Monitored URLs (comma-separated)" "https://yourapp.com")
  slack=$(prompt_var "SLACK_WEBHOOK_URL" "Slack webhook URL (leave empty to skip)" "")
  AGENTS_SECTION_VARS=("STAGING_URL" "MONITORED_URLS" "SLACK_WEBHOOK_URL")
  AGENTS_SECTION_VALS=("$staging" "$monitored" "$slack")
  write_section "Playwright Agents" AGENTS_SECTION_VARS AGENTS_SECTION_VALS
}

prompt_google() {
  echo -e "\n${BOLD}Google Drive & Docs MCP${RESET} ${DIM}(npx @modelcontextprotocol/server-gdrive)${RESET}"
  echo ""
  echo -e "  ${BOLD}Setup steps (one-time):${RESET}"
  echo -e "  ${CYAN}1.${RESET} Go to: ${DIM}console.cloud.google.com${RESET}"
  echo -e "  ${CYAN}2.${RESET} Create or select a project"
  echo -e "  ${CYAN}3.${RESET} Enable APIs: ${DIM}APIs & Services → Library${RESET}"
  echo -e "       → Google Drive API  ✓"
  echo -e "       → Google Docs API   ✓"
  echo -e "  ${CYAN}4.${RESET} Create credentials: ${DIM}APIs & Services → Credentials${RESET}"
  echo -e "       → Create Credentials → OAuth 2.0 Client ID"
  echo -e "       → Application type: ${BOLD}Desktop app${RESET}"
  echo -e "       → Download JSON → rename to ${BOLD}google.json${RESET}"
  echo -e "  ${CYAN}5.${RESET} Place the file at the path you'll enter below"
  echo -e "  ${DIM}  On first use, a browser window will open to complete OAuth authorization${RESET}"
  echo ""
  local creds_path
  creds_path=$(prompt_var "GOOGLE_CREDENTIALS_PATH" "Path to credentials.json" ".credentials/google.json")
  mkdir -p "$ROOT/$(dirname "$creds_path")"
  GOOGLE_SECTION_VARS=("GOOGLE_CREDENTIALS_PATH")
  GOOGLE_SECTION_VALS=("$creds_path")
  write_section "Google Drive & Docs MCP" GOOGLE_SECTION_VARS GOOGLE_SECTION_VALS
  if [[ ! -f "$ROOT/$creds_path" ]]; then
    echo -e "  ${YELLOW}⚠${RESET}  Remember to place ${BOLD}google.json${RESET} at: $creds_path"
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
  echo -e "${BOLD}Select integrations to configure:${RESET}"
  echo -e "${DIM}Enter numbers separated by spaces, or 'all' for everything${RESET}\n"
  local i=1
  for entry in "${INTEGRATIONS[@]}"; do
    local id="${entry%%:*}"
    local label="${entry#*:}"
    printf "  ${CYAN}%d)${RESET} %-52s\n" "$i" "$label"
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

# Guard: warn if .env already exists
if [[ -f "$ENV_FILE" ]]; then
  echo -e "${YELLOW}⚠  .env already exists.${RESET}"
  echo -ne "   Overwrite it? This will erase the current file. ${BOLD}[y/N]${RESET}: "
  read -r confirm
  if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
    echo ""
    echo -e "  Tip: run ${CYAN}bash scripts/add-integration.sh${RESET} to add to an existing .env"
    echo ""
    exit 0
  fi
fi

# Write file header
cat > "$ENV_FILE" <<'HEADER'
# .env — claude-code-toolkit environment variables
# Generated by scripts/setup.sh — DO NOT commit this file
HEADER

# Show menu and get selection
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
    github)     prompt_github ;;
    google)     prompt_google ;;
    postgresql) prompt_postgresql ;;
    redis)      prompt_redis ;;
    datadog)    prompt_datadog ;;
    agents)     prompt_agents ;;
  esac
done

echo ""
echo -e "${GREEN}✅ .env written to:${RESET} $ENV_FILE"
echo ""
echo -e "${BOLD}Next steps:${RESET}"
echo -e "  • ${CYAN}bash scripts/docker-up.sh${RESET}  — pull Docker images and build Datadog MCP"
echo -e "  • ${CYAN}npm run validate-skills${RESET}     — verify all skills are valid"
echo -e "  • Reload Claude Code to connect MCP servers"
echo ""
