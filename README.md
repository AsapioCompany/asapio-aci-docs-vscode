# ASAPIO MCP Server for Integration Add-on Docs

Search and retrieve **ASAPIO Integration Add-on documentation** directly inside GitHub Copilot Chat or the VS Code command palette – with instant, local, focused answers. No browser switching, no copy-pasting, no online fetches.

## Features

- ⚡ **Blazing fast, local-only docs** – all documentation is served from the `/docs` folder inside the extension
- 🔍 **Full-text search** across all local documentation pages, prioritized by an overview map
- 🎯 **Focused answers** – only the most relevant section (with formatting) is shown for your query
- 🖼️ **Images** – Markdown image links are preserved and rendered inline if accessible in VS Code. All image paths must be relative (e.g. `img/...`) and images must be in `/docs/img/` inside the extension.
- 📋 **Browse all pages** with titles and links
- 🔄 **Manual reload** – refresh the local doc index at any time
- 💬 **/asapio command** – Search ASAPIO docs from the command palette or chat with `/asapio <query>`

## Getting Started

1. Get yourself a cup of coffee.
2. Install this extension from the VSIX file or Marketplace, or clone and run:
	```sh
	npm install --omit=dev
	```
3. Restart VS Code to activate the extension.
4. Open GitHub Copilot Chat or the VS Code command palette and try:
	- `/asapio <your query>` – Search ASAPIO docs from anywhere
	- `asapio-search` – Search for "connector setup"
	- `asapio-list` – List all available documentation pages
	- `asapio-get` – Get the most relevant section from a page
5. If you add or update docs, use the `asapio-reload` command to refresh the index.

## Available Commands

| Command         | Description                                      |
|-----------------|--------------------------------------------------|
| `/asapio`       | Search ASAPIO docs from palette or chat          |
| `asapio-search` | Search documentation by keyword (focused answer) |
| `asapio-get`    | Get the most relevant section of a page          |
| `asapio-list`   | List all available pages                         |
| `asapio-outline`| Show the outline of a page                       |
| `asapio-reload` | Refresh the documentation cache                  |

## Settings

| Setting                              | Default   | Description                                                                 |
|--------------------------------------|-----------|-----------------------------------------------------------------------------|
| `asapioAciDocs.imageServingMode`     | `relative`| How to serve images: `relative` (workspace path, default) or `base64` (embed as data URL) |



> **Note:**
> - The extension uses `overview.md` to prioritize and map queries to the right file.
> - Images are rendered inline if the path is accessible in VS Code. Base64 embedding is not enabled by default.

## Requirements

- VS Code ≥ 1.99
- GitHub Copilot Chat extension

## License

MIT – see [LICENSE](LICENSE).
Documentation content © ASAPIO GmbH. All rights reserved.
