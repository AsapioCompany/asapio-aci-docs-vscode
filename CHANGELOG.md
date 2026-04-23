# Changelog

## 1.3.0 (2026-04-23)
- Added configurable image serving mode: choose between workspace-relative paths (default, recommended for VS Code) or base64-embedded images via `asapioAciDocs.imageServingMode` setting.
- Removed `cacheTtlSeconds` configuration option (no longer needed with persistent index and in-memory search cache).
- Automated persistent documentation index build during packaging (`prepackage` script).
- Improved README to document new image serving mode and removed obsolete settings.
- Version bump to 1.3.0.

## 1.2.x and earlier
- Initial MCP server and VS Code extension for ASAPIO documentation.
- Full-text search, section ranking, and local doc serving.
- Inline image support (base64 and relative path, now configurable).
- Command palette and Copilot Chat integration.
