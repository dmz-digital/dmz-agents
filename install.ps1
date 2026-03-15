# ============================================================
#  DMZ OS — Instalador Universal (Windows)
#  Uso: iex (iwr https://dmz-os.netlify.app/install.ps1).Content
# ============================================================

# ─── Configurar Encoding de Saída ──────────────────────────────
# Isso resolve os caracteres "???" na logo e mensagens
Try {
    [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
} Catch {}
$env:PYTHONIOENCODING = "utf-8"

$ErrorActionPreference = "Stop"

# Cores (ANSI)
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
Write-Host "$YELLOW           Versão 0.4.3          "
Write-Host "$RESET"
Write-Host ("$DIM" + ("─" * 50) + "$RESET")
Write-Host ""

# ─── Checar Python ───────────────────────────────────────────
Write-Host "$CYANVerificando requisitos...$RESET"

function Test-Python {
    param($cmd)
    try {
        $result = & $cmd --version 2>&1
        if ($LASTEXITCODE -eq 0 -and $result -match "Python 3") {
            return $true
        }
    } catch {}
    return $false
}

$pyCommand = ""
if (Test-Python "python") {
    $pyCommand = "python"
} elseif (Test-Python "python3") {
    $pyCommand = "python3"
} else {
    Write-Host "$RED" + "✗ Python 3 não encontrado ou não está no PATH.$RESET"
    Write-Host "$YELLOW" + "  Dica: Se você instalou o Python agora, reinicie o terminal.$RESET"
    Write-Host "$DIM" + "  Baixe em: https://www.python.org/downloads/ (Marque 'Add Python to PATH')$RESET"
    exit 1
}

# Pegar versão exata
try {
    $pyVer = & $pyCommand -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')"
    $pyMajor = [int](& $pyCommand -c "import sys; print(sys.version_info.major)")
    $pyMinor = [int](& $pyCommand -c "import sys; print(sys.version_info.minor)")
} catch {
    Write-Host "$RED" + "✗ Erro ao validar versão do Python.$RESET"
    exit 1
}

if ($pyMajor -lt 3 -or ($pyMajor -eq 3 -and $pyMinor -lt 10)) {
    Write-Host ("$RED" + "✗ Python $pyVer encontrado. Mínimo: Python 3.10$RESET")
    exit 1
}

Write-Host ("  $GREEN" + "✓$RESET Python $pyVer")

# ─── Instalar dmz-os ──────────────────────────────────────────
Write-Host ""
Write-Host "$CYANInstalando/Atualizando dmz-os (MCP Universal)...$RESET"

$INSTALL_URL = "https://github.com/dmz-digital/dmz-agents/archive/refs/heads/main.zip#subdirectory=cli"

# Tenta instalar via pip (Forçando upgrade e sem cache)
Try {
    Write-Host "$DIM  Preparando ambiente e limpando cache...$RESET"
    & $pyCommand -m pip uninstall dmz-os -y 2>$null | Out-Null
    & $pyCommand -m pip install $INSTALL_URL --upgrade --no-cache-dir --quiet
    Write-Host "  $GREEN✓$RESET Instalação concluída com sucesso."
} Catch {
    Write-Host ("$YELLOW" + "⚠ Falha na instalação padrão. Tentando com permissões de usuário...$RESET")
    & $pyCommand -m pip install $INSTALL_URL --upgrade --no-cache-dir --user --quiet
}

# Verificar se instalou mesmo
try {
    & $pyCommand -m dmz_os --help | Out-Null
} catch {
    Write-Host "$RED" + "✗ Falha crítica: O comando 'dmz-os' não foi reconhecido após a instalação.$RESET"
    Write-Host "$DIM  Tente rodar manualmente: pip install dmz-os --upgrade$RESET"
    exit 1
}

# ─── Chamar o install interativo ─────────────────────────────
Write-Host ""
Write-Host ("$DIM" + ("─" * 50) + "$RESET")
Write-Host ""
Write-Host ("$BOLD" + "Iniciando configuração do squad...$RESET")
Write-Host ""

# Executa o comando install interativo
& $pyCommand -m dmz_os install
