# ASAPIO MCP Server for Integration Add-on docs 

Search and retrieve **ASAPIO Integration Add-on documentation** directly inside GitHub Copilot Chat – no browser switching, no copy-pasting.

## Features

- 🔍 **Full-text search** across all ASAPIO documentation pages
- 📄 **Read any page** in full without leaving VS Code
- 📋 **Browse all pages** with titles and links
- 🔄 **Always up to date** – docs are fetched live from asapio.com/docs/

## Getting Started

1. Install this extension
2. Restart VS Code
3. Open Copilot Chat and try:

npm install @modelcontextprotocol/sdk zod node-html-parser --omit=dev
```
Search the ASAPIO documentation for "connector setup"
List all available ASAPIO documentation pages
How do I configure a new user in ACI?
```

## Available Commands (Copilot Chat)

| Command | Description |
|---------|-------------|
| `search_docs` | Search documentation by keyword |
| `get_doc` | Get the full content of a page |
| `list_docs` | List all available pages |
| `get_doc_sections` | Show the outline of a page |
| `reload_docs` | Refresh the documentation cache |

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `asapioAciDocs.docsBaseUrl` | `https://asapio.com/docs` | Documentation base URL |
| `asapioAciDocs.cacheTtlSeconds` | `3600` | Cache lifetime in seconds |

## Requirements

- VS Code ≥ 1.99
- GitHub Copilot Chat extension

## License

MIT – see [LICENSE](LICENSE).  
Documentation content © ASAPIO GmbH. All rights reserved.
