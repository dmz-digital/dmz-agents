import sys
from pathlib import Path

def mcp_server_command():
    """Inicia o MCP Server local para integração com a IDE."""
    # Como o mcp sdk manipula stdio, não queremos logs do rich ou print vazando
    from dmz_os.mcp_server.server import mcp
    mcp.run()
