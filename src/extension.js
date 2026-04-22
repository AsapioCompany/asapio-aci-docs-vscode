"use strict";

/**
 * ASAPIO ACI Docs – VS Code Extension
 *
 * Registers the MCP server for ASAPIO documentation so it is
 * automatically available in GitHub Copilot Chat without any
 * manual configuration by the user.
 */

const vscode = require("vscode");
const path   = require("path");
const fs     = require("fs");

const MCP_SERVER_KEY = "asapio-aci-docs";

// ─── Activation ───────────────────────────────────────────────────────────────

async function activate(context) {
  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand("asapio-reload",     handleReload),
    vscode.commands.registerCommand("asapio-status",     handleShowStatus),
    vscode.commands.registerCommand("asapio-search",     handleAsapioSearch),
    vscode.commands.registerCommand("asapio-list",       handleAsapioList),
    vscode.commands.registerCommand("asapio-get",        handleAsapioGet),
    vscode.commands.registerCommand("asapio-outline",    handleAsapioOutline),
    vscode.commands.registerCommand("asapio.asapio",     handleAsapioCommand)
  );
// ─── New Command Handlers ─────────────────────────────────────────────────--
async function handleAsapioSearch() {
  const query = await vscode.window.showInputBox({
    prompt: "Search ASAPIO documentation (type your question or topic)",
    placeHolder: "e.g. connector setup, event mesh, monitoring..."
  });
  if (!query) return;
  vscode.window.showInformationMessage(`Searching ASAPIO docs for: ${query}`);
  // TODO: Integrate with MCP server search
}

async function handleAsapioList() {
  vscode.window.showInformationMessage("Listing all ASAPIO documentation pages...");
  // TODO: Integrate with MCP server list_docs
}

async function handleAsapioGet() {
  const page = await vscode.window.showInputBox({ prompt: "Enter the page name (e.g. monitoring.md)" });
  if (!page) return;
  vscode.window.showInformationMessage(`Getting most relevant section from: ${page}`);
  // TODO: Integrate with MCP server get_doc
}

async function handleAsapioOutline() {
  const page = await vscode.window.showInputBox({ prompt: "Enter the page name for outline (e.g. monitoring.md)" });
  if (!page) return;
  vscode.window.showInformationMessage(`Showing outline for: ${page}`);
  // TODO: Integrate with MCP server get_doc_sections
}

  // Listen for 'asapio' in editor selection
  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection(async (e) => {
      const text = e.textEditor.document.getText(e.selections[0]);
      if (text && /asapio/i.test(text)) {
        const action = await vscode.window.showInformationMessage(
          `You selected text containing 'asapio'. Search ASAPIO documentation?`,
          'Search', 'Ignore'
        );
        if (action === 'Search') {
          vscode.commands.executeCommand('asapio.asapio', text);
        }
      }
    })
  );

  // Listen for 'asapio' in command palette input (Quick Open)
  context.subscriptions.push(
    vscode.commands.registerCommand('asapio.detectInPalette', async () => {
      const query = await vscode.window.showInputBox({
        prompt: "Type to search ASAPIO documentation (type 'asapio' to trigger)",
        placeHolder: "e.g. asapio connector setup, monitoring..."
      });
      if (query && /asapio/i.test(query)) {
        vscode.commands.executeCommand('asapio.asapio', query);
      }
    })
  );

  // Configure MCP in every open workspace
  await ensureMcpConfig(context);

  // Re-check when workspace folders change
  context.subscriptions.push(
    vscode.workspace.onDidChangeWorkspaceFolders(() => ensureMcpConfig(context))
  );

  // Status bar item
  const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBar.text    = "$(book) ASAPIO Docs";
  statusBar.tooltip = "ASAPIO ACI Docs MCP – click to show status";
  statusBar.command = "asapioAciDocs.showStatus";
  statusBar.show();
  context.subscriptions.push(statusBar);
}

function deactivate() {}

// ─── MCP config ───────────────────────────────────────────────────────────────

async function ensureMcpConfig(context) {
  const config   = vscode.workspace.getConfiguration("asapioAciDocs");
  const docsUrl  = config.get("docsBaseUrl",     "https://asapio.com/docs");
  const cacheTtl = config.get("cacheTtlSeconds",  3600);

  // server.js is bundled inside the extension under server/
  const serverJs = context.asAbsolutePath("server/server.mjs");

  const folders = vscode.workspace.workspaceFolders || [];
  for (const folder of folders) {
    const vscodeDir = path.join(folder.uri.fsPath, ".vscode");
    const mcpJson   = path.join(vscodeDir, "mcp.json");

    let mcpConfig = { servers: {} };
    if (fs.existsSync(mcpJson)) {
      try { mcpConfig = JSON.parse(fs.readFileSync(mcpJson, "utf-8")); }
      catch { /* corrupt – overwrite */ }
    }
    mcpConfig.servers = mcpConfig.servers || {};

    // Skip if already up to date
    const existing = mcpConfig.servers[MCP_SERVER_KEY];
    if (existing?.args?.[0] === serverJs) continue;

    mcpConfig.servers[MCP_SERVER_KEY] = {
      type:    "stdio",
      command: process.execPath,  // Node.js bundled with VS Code
      args:    [serverJs],
      env: {
        DOCS_BASE_URL:     docsUrl,
        CACHE_TTL_SECONDS: String(cacheTtl),
      },
    };

    fs.mkdirSync(vscodeDir, { recursive: true });
    fs.writeFileSync(mcpJson, JSON.stringify(mcpConfig, null, 2) + "\n", "utf-8");
  }
}

// ─── Commands ─────────────────────────────────────────────────────────────────

async function handleReload() {
  vscode.window.showInformationMessage(
    'ASAPIO ACI Docs: Type "reload_docs" in Copilot Chat to refresh the documentation cache.'
  );
}

async function handleShowStatus() {
  const config   = vscode.workspace.getConfiguration("asapioAciDocs");
  const docsUrl  = config.get("docsBaseUrl", "https://asapio.com/docs");
  const cacheTtl = config.get("cacheTtlSeconds", 3600);
  vscode.window.showInformationMessage(
    `ASAPIO ACI Docs MCP Server\nDocs: ${docsUrl}\nCache TTL: ${cacheTtl}s\n\nType "reload_docs" in Copilot Chat to refresh.`
  );
}

// ─── /asapio Command Handler ────────────────────────────────────────────────
async function handleAsapioCommand(...args) {
  let query = args && args.length > 0 ? args.join(" ") : undefined;
  if (!query) {
    query = await vscode.window.showInputBox({
      prompt: "Search ASAPIO documentation (type your question or topic)",
      placeHolder: "e.g. connector setup, event mesh, monitoring..."
    });
    if (!query) return;
  }
  // Optionally: call MCP server or show quick pick for further actions
  vscode.commands.executeCommand("workbench.action.showCommands");
  vscode.window.showInformationMessage(`Searching ASAPIO docs for: ${query}`);
  // TODO: Integrate with MCP server search_docs tool
}

module.exports = { activate, deactivate };
