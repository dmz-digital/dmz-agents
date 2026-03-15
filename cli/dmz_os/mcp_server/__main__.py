import sys
from pathlib import Path

# Adiciona o diretório cli ao sys.path para importações locais
cli_dir = Path(__file__).parent.parent.parent
if str(cli_dir) not in sys.path:
    sys.path.insert(0, str(cli_dir))

from dmz_os.mcp_server.server import mcp

if __name__ == "__main__":
    mcp.run()
