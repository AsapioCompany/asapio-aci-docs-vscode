npm install @modelcontextprotocol/sdk zod node-html-parser --omit=dev

# ASAPIO MCP Server for Integration Add-on Docs (Local-First)

Search and retrieve **ASAPIO Integration Add-on documentation** directly inside GitHub Copilot Chat – with instant, local, focused answers and embedded images. No browser switching, no copy-pasting, no online fetches.

## Features

- ⚡ **Blazing fast, local-only docs** – all documentation is served from your local `/docs` folder
- 🔍 **Full-text search** across all local documentation pages
- 🎯 **Focused answers** – only the most relevant section (with images and formatting) is shown for your query
- 🖼️ **Embedded images** – images are included inline, even in search results
- 📋 **Browse all pages** with titles and links
- 🔄 **Manual reload** – refresh the local doc index at any time

## Getting Started

1. Get yourself a good cup of coffee or tea
2. Install this extension and its dependencies:
	```sh
	npm install --omit=dev
	```
3. Restart VS Code
4. Open Copilot Chat and try:
	- `search_docs` – Search for "connector setup"
	- `list_docs` – List all available documentation pages
	- `get_doc` – Get the most relevant section from a page

## Available Commands (Copilot Chat)

| Command         | Description                                      |
|-----------------|--------------------------------------------------|
| `search_docs`   | Search documentation by keyword (focused answer) |
| `get_doc`       | Get the most relevant section of a page          |
| `list_docs`     | List all available pages                         |
| `get_doc_sections` | Show the outline of a page                    |
| `reload_docs`   | Refresh the documentation cache                  |

## Settings

| Setting                        | Default | Description                        |
|--------------------------------|---------|------------------------------------|
| `asapioAciDocs.cacheTtlSeconds`| `3600`  | Cache lifetime in seconds           |

> **Note:** The `docsBaseUrl` setting and all online fetching have been removed. All docs are local-only for maximum speed and privacy.

## Requirements

- VS Code ≥ 1.99
- GitHub Copilot Chat extension

## License

MIT – see [LICENSE](LICENSE).
Documentation content © ASAPIO GmbH. All rights reserved.
