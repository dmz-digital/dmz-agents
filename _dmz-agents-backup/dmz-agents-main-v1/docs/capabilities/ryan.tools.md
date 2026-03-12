Tool 1 — code_executor

Finalidade: Executar trechos de código em ambiente sandbox para validar lógica, testar algoritmos e verificar comportamento antes de integrar ao repositório.

json{
  "name": "code_executor",
  "description": "Executa código em sandbox seguro para validação de lógica, testes rápidos e prototipagem técnica.",
  "parameters": {
    "language": "enum: typescript | javascript | python | sql",
    "code": "string — código a ser executado",
    "context": "string — descrição do que está sendo testado",
    "input_data": "object — dados de entrada para o código (opcional)",
    "expected_output": "string — comportamento esperado para validação"
  }
}

Tool 2 — repository_manager

Finalidade: Interagir com o repositório de código — consultar arquivos, criar branches, abrir pull requests e registrar commits com mensagens padronizadas.

json{
  "name": "repository_manager",
  "description": "Gerencia operações no repositório de código: leitura de arquivos, criação de branches, commits e pull requests.",
  "parameters": {
    "action": "enum: read_file | list_files | create_branch | commit | open_pr | get_pr_status",
    "repo": "string — nome do repositório",
    "branch": "string — branch de trabalho",
    "file_path": "string — caminho do arquivo (para read/commit)",
    "content": "string — conteúdo do arquivo (para commit)",
    "commit_message": "string — mensagem no padrão Conventional Commits",
    "pr_title": "string — título do pull request",
    "pr_description": "string — descrição detalhada do PR"
  }
}