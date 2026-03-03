#!/usr/bin/env bash
# ============================================================
#  DMZ OS — Instalador Universal
#  Uso: curl -fsSL https://dmz-os.netlify.app/install.sh | bash
# ============================================================

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
DIM='\033[2m'
RESET='\033[0m'

# ─── Logo ────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}${BOLD}"
echo "     ██████╗ ███╗   ███╗███████╗"
echo "     ██╔══██╗████╗ ████║╚══███╔╝"
echo "     ██║  ██║██╔████╔██║  ███╔╝ "
echo "     ██║  ██║██║╚██╔╝██║ ███╔╝  "
echo "     ██████╔╝██║ ╚═╝ ██║███████╗"
echo "     ╚═════╝ ╚═╝     ╚═╝╚══════╝"
echo "                                 "
echo "        Agent Squad Platform     "
echo -e "${RESET}"
echo -e "${DIM}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""

# ─── Checar Python ───────────────────────────────────────────
echo -e "${CYAN}Verificando requisitos...${RESET}"

if ! command -v python3 &>/dev/null; then
    echo -e "${RED}✗ Python 3 não encontrado.${RESET}"
    echo -e "${DIM}  Instale em https://python.org${RESET}"
    exit 1
fi

PY_VER=$(python3 -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
PY_MAJOR=$(python3 -c "import sys; print(sys.version_info.major)")
PY_MINOR=$(python3 -c "import sys; print(sys.version_info.minor)")

if [ "$PY_MAJOR" -lt 3 ] || ([ "$PY_MAJOR" -eq 3 ] && [ "$PY_MINOR" -lt 10 ]); then
    echo -e "${RED}✗ Python $PY_VER encontrado. Mínimo: Python 3.10${RESET}"
    exit 1
fi

echo -e "  ${GREEN}✓${RESET} Python $PY_VER"

if ! command -v pip3 &>/dev/null && ! command -v pip &>/dev/null; then
    echo -e "${RED}✗ pip não encontrado.${RESET}"
    exit 1
fi

PIP=$(command -v pip3 || command -v pip)
echo -e "  ${GREEN}✓${RESET} pip encontrado"

# ─── Instalar dmz-os ─────────────────────────────────────────
echo ""
echo -e "${CYAN}Instalando dmz-os...${RESET}"

$PIP install dmz-os --quiet --upgrade 2>&1 | grep -v "^$" | head -5 || true

# Verifica se instalou
if ! command -v dmz-os &>/dev/null; then
    # Tenta via python -m
    python3 -m pip install dmz-os --quiet --upgrade 2>&1 | head -5 || true
fi

if ! command -v dmz-os &>/dev/null && ! python3 -c "import dmz_os" &>/dev/null 2>&1; then
    echo -e "${YELLOW}⚠ dmz-os instalado mas o comando não está no PATH.${RESET}"
    echo -e "${DIM}  Use: python3 -m dmz_os install${RESET}"
    echo ""
fi

echo -e "  ${GREEN}✓${RESET} dmz-os instalado com sucesso"

# ─── Chamar o install interativo ─────────────────────────────
echo ""
echo -e "${DIM}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""
echo -e "${BOLD}Iniciando configuração do squad...${RESET}"
echo ""

# Executa o comando install interativo (passa TTY)
if command -v dmz-os &>/dev/null; then
    exec dmz-os install
else
    exec python3 -m dmz_os install
fi
