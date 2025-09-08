claude mcp add memory -e MEMORY_FILE_PATH=/mnt/c/projects/personal/vtttools/.claude/memory.json -- npx -y @modelcontextprotocol/server-memory
claude mcp add playwright -- npx "@playwright/mcp@latest"
claude mcp add thinking -- npx -y @modelcontextprotocol/server-sequential-thinking
claude mcp add calculator -- uvx mcp-server-calculator 
