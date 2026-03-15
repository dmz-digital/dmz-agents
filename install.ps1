# ============================================================
#  DMZ OS — Instalador Universal (Windows)
#  Uso: iex (iwr https://dmz-os.netlify.app/install.ps1).Content
# ============================================================

$ErrorActionPreference = "Stop"

# Cores
$CYAN = "`e[0;36m"
$GREEN = "`e[0;32m"
$RED = "`e[0;31m"
$YELLOW = "`e[1;33m"
$BOLD = "`e[1m"
$DIM = "`e[2m"
$RESET = "`e[0m"

# ─── Logo ────────────────────────────────────────────────────
Write-Host ""
Write-Host "$CYAN$BOLD"
Write-Host "     ██████╗ ███╗   ███╗███████╗"
Write-Host "     ██╔══██╗████╗ ████║╚══███╔╝"
Write-Host "     ██║  ██║██╔████╔██║  ███╔╝ "
Write-Host "     ██║  ██║██║╚██╔╝██║ ███╔╝  "
Write-Host "     ██████╔╝██║ ╚═╝ ██║███████╗"
Write-Host "     ╚═════╝ ╚═╝     ╚═╝╚══════╝"
Write-Host "                                 "
Write-Host "        Agent Squad Platform     "
Write-Host "$RESET"
Write-Host "$DIM" + ("─" * 50) + "$RESET"
Write-Host ""

# ─── Checar Python ───────────────────────────────────────────
Write-Host "$CYANVerificando requisitos...$RESET"

$pyCommand = "python"
if (!(Get-Command python -ErrorAction SilentlyContinue)) {
    if (Get-Command python3 -ErrorAction SilentlyContinue) {
        $pyCommand = "python3"
    } else {
        Write-Host "$RED" + "✗ Python 3 não encontrado.$RESET"
        Write-Host "$DIM" + "  Instale em https://python.org$RESET"
        exit 1
    }
}

$pyVer = & $pyCommand -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')"
$pyMajor = [int](& $pyCommand -c "import sys; print(sys.version_info.major)")
$pyMinor = [int](& $pyCommand -c "import sys; print(sys.version_info.minor)")

if ($pyMajor -lt 3 -or ($pyMajor -eq 3 -and $pyMinor -lt 10)) {
    Write-Host "$RED" + "✗ Python $pyVer encontrado. Mínimo: Python 3.10$RESET"
    exit 1
}

Write-Host "  $GREEN" + "✓$RESET Python $pyVer"

# ─── Instalar dmz-os ──────────────────────────────────────────
Write-Host ""
Write-Host "$CYANInstalando/Atualizando dmz-os v0.4.0 (MCP Universal)...$RESET"

$INSTALL_URL = "https://github.com/dmz-digital/dmz-agents/archive/refs/heads/main.zip#subdirectory=cli"

# Tenta instalar via pip
Try {
    & $pyCommand -m pip install $INSTALL_URL --quiet --upgrade --no-cache-dir
} Catch {
    Write-Host "$YELLOW" + "⚠ Falha na instalação automática. Tentando modo de compatibilidade...$RESET"
    & $pyCommand -m pip install $INSTALL_URL --quiet --upgrade --no-cache-dir --user
}

# ─── Chamar o install interativo ─────────────────────────────
Write-Host ""
Write-Host "$DIM" + ("─" * 50) + "$RESET"
Write-Host ""
Write-Host "$BOLD" + "Iniciando configuração do squad...$RESET"
Write-Host ""

# Executa o comando install interativo
& $pyCommand -m dmz_os install
