#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { parse } from "node-html-parser";
import https from "https";
import http from "http";
import fs from "fs";
import path from "path";
import { marked } from "marked";

// ─── Overview Mapping ───────────────────────────────────────────────────────

// Persistent index and search cache
const DOCS_INDEX_FILE = path.resolve(__dirname, "docs_index.json");
let docsIndex = [];
let searchCache = new Map(); // key: query, value: { results, timestamp }

function loadDocsIndex() {
  if (fs.existsSync(DOCS_INDEX_FILE)) {
    docsIndex = JSON.parse(fs.readFileSync(DOCS_INDEX_FILE, "utf-8"));
  } else {
    docsIndex = [];
  }
}
loadDocsIndex();

/**
 * ASAPIO ACI Docs – MCP Server (mcp-aci-docs)
 *
 */


// ─── Configuration ────────────────────────────────────────────────────────────

const CACHE_TTL_MS  = parseInt(process.env.CACHE_TTL_SECONDS || "3600") * 1000; // default: 1 hour
// Use docs folder inside the extension directory
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const LOCAL_DOCS_DIR = path.resolve(__dirname, "../docs");

// Read image serving mode from VS Code config via env var (set by extension)
const IMAGE_SERVING_MODE = process.env.ASAPIO_IMAGE_SERVING_MODE || "relative";
// ─── Local Docs Helpers ─────────────────────────────────────────────────────

function listLocalDocs() {
  if (!fs.existsSync(LOCAL_DOCS_DIR)) return [];
  return fs.readdirSync(LOCAL_DOCS_DIR)
    .filter(f => f.endsWith(".md"))
    .map(f => path.join(LOCAL_DOCS_DIR, f));
}

function readLocalDoc(docPath) {
  const fullPath = path.isAbsolute(docPath)
    ? docPath
    : path.join(LOCAL_DOCS_DIR, docPath.replace(/^\/+/ , ""));
    if (docCache.has(fullPath)) return docCache.get(fullPath);
  if (fs.existsSync(fullPath)) {
    return fs.readFileSync(fullPath, "utf-8");
  }
  return null;
}

// ─── Cache ────────────────────────────────────────────────────────────────────

let   indexCache = null;     // { pages, builtAt }

// ─── Link extraction ──────────────────────────────────────────────────────────


// ─── HTML → Document & Section Extraction ────────────────────────────────────

function parseDoc(md, url) {
  // Use marked lexer to extract tokens
  const tokens = marked.lexer(md);
  let title = "";
  let description = "";
  let content = "";
  let headings = [];
  let sections = [];
  let current = null;
  for (const token of tokens) {
    if (token.type === "heading" && token.depth <= 3) {
      if (current) sections.push(current);
      current = { heading: token.text, md: "", tokens: [] };
      headings.push(token.text);
      if (!title && token.depth === 1) title = token.text;
    }
    if (current) {
      current.md += token.raw || token.text || "";
      current.tokens.push(token);
    }
  }
  if (current) sections.push(current);
  if (!title && headings.length > 0) title = headings[0];
  if (!title) title = url.split("/").filter(Boolean).pop() || url;
  content = md.slice(0, 8000);
  // Fallback: whole content
  if (sections.length === 0) {
    sections.push({ heading: title, md, tokens: tokens });
  }
  return { url, path: url, title, description, content, headings, sections };
}


// ─── Search & Section Scoring (Fuzzy, Phrase, Context) ─────────────────────--


// ─── Search & Section Scoring (Fuzzy, Phrase, Context) ─────────────────────--
import Fuse from "fuse.js";

function scoreSection(section, query) {
  // Use Fuse.js fuzzy scoring for best match
  const text = (section.heading + "\n" + (section.md || ""));
  const fuse = new Fuse([{text}], { keys: ['text'], includeScore: true, threshold: 0.4 });
  const result = fuse.search(query);
  let score = result.length > 0 ? 100 - (result[0].score * 100) : 0;
  // Boost for exact phrase, heading match, and context
  if (section.heading && section.heading.toLowerCase().includes(query.toLowerCase())) score += 20;
  if (text.toLowerCase().includes(query.toLowerCase())) score += 15;
  // Length penalty (prefer concise answers)
  score -= Math.floor((section.md || "").length / 2000);
  return score;
}

// Inline image embedding: replace ![...](...) with base64 data URLs if possible
function embedImagesInMarkdown(md, docDir) {
  return md.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, relPath) => {
    // Only handle relative paths
    if (/^(https?:|data:)/i.test(relPath)) return match;
    const imgPath = path.resolve(docDir, relPath);
    if (fs.existsSync(imgPath)) {
      if (IMAGE_SERVING_MODE === "base64") {
        const ext = path.extname(imgPath).slice(1).toLowerCase();
        const mime = ext === "svg" ? "image/svg+xml" : `image/${ext}`;
        const data = fs.readFileSync(imgPath);
        const base64 = data.toString("base64");
        return `![${alt}](data:${mime};base64,${base64})`;
      } else {
        // workspace-relative path (default)
        const relToWorkspace = path.relative(process.cwd(), imgPath).replace(/\\/g, "/");
        return `![${alt}](${relToWorkspace})`;
      }
    }
    return match;
  });
}


async function searchDocs(query, limit = 5) {
  // Check cache first
  const cacheKey = `${query}|${limit}`;
  const cacheEntry = searchCache.get(cacheKey);
  if (cacheEntry && Date.now() - cacheEntry.timestamp < 1000 * 60 * 10) { // 10 min cache
    return cacheEntry.results;
  }
  // Score all docs/sections in persistent index
  const results = [];
  for (const doc of docsIndex) {
    const docPath = path.join(LOCAL_DOCS_DIR, doc.file);
    for (const section of doc.sections || []) {
      const score = scoreSection(section, query);
      if (score > 0) {
        // Embed images in the section markdown
        const docDir = path.dirname(docPath);
        let mdWithImages = embedImagesInMarkdown(section.md, docDir);
        // Highlight matches
        const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")})`, 'gi');
        mdWithImages = mdWithImages.replace(re, '**$1**');
        results.push({ ...doc, bestSection: { ...section, md: mdWithImages }, score });
      }
    }
    if (results.length >= limit) break;
  }
  const sorted = results.sort((a, b) => b.score - a.score).slice(0, limit);
  searchCache.set(cacheKey, { results: sorted, timestamp: Date.now() });
  return sorted;
}


// ─── MCP Server ───────────────────────────────────────────────────────────────

const server = new McpServer({ name: "mcp-aci-docs", version: "2.0.0" });

// ── allow_online_fallback ─────────────────────────────────────────────────---
server.tool(
  "allow_online_fallback",
  "Ask the user for permission to fetch a documentation page from the website if not found locally.",
  {
    docPath: z.string().describe("The documentation path or name requested by the user."),
  },
  async ({ docPath }) => {
    return {
      content: [{
        type: "text",
        text: `The documentation page '${docPath}' was not found locally. Do you want to fetch it from the website? (yes/no)`
      }]
    };
  }
);

// ── search_docs ───────────────────────────────────────────────────────────────
server.tool(
  "search_docs",
  "Search the ASAPIO ACI documentation at asapio.com/docs/. Returns matching pages with title, URL and text excerpt.",
  {
    query: z.string().describe("Search query, e.g. 'configure connector' or 'create user'"),
    limit: z.number().int().min(1).max(20).default(5).describe("Maximum number of results to return"),
  },
  async ({ query, limit }) => {
    const results = await searchDocs(query, limit);
    if (results.length === 0) {
      return { content: [{ type: "text", text: `❌ **No results found for:** "${query}"

**Tips:**
- Check your spelling or try a different keyword
- Try a more general term (e.g. "connector" or "event")
- Use the "/asapio" command for guided search
- Type "/asapio-help" for usage instructions
` }] };
    }
    // Show all relevant sections, formatted
    const text = results.map((doc, i) => [
      `---\n### ${i + 1}. ${doc.title} (${doc.path})`,
      doc.bestSection.heading ? `#### Section: ${doc.bestSection.heading}` : "",
      doc.bestSection.md || ""
    ].filter(Boolean).join("\n")).join("\n");

    return { content: [{ type: "text", text: `**${results.length} result(s) for:** "${query}"
${text}` }] };
  }
);

// ── get_doc ───────────────────────────────────────────────────────────────────
server.tool(
  "get_doc",
  "Returns the full content of an ASAPIO documentation page.",
  {
    path: z.string().describe("Path or full URL, e.g. 'getting-started.html' or 'https://asapio.com/docs/setup.html'"),
  },
  async ({ path: docPath, query }) => {
    // Only use local docs
    let md = readLocalDoc(docPath);
    let url = docPath;
    if (!md) {
      return { content: [{ type: "text", text: `Document '${docPath}' not found locally.` }] };
    }
    const doc  = parseDoc(md, url);
    // If a query is provided, show only the most relevant section
    if (query) {
      const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
      let bestSection = null;
      let bestScore = 0;
      for (const section of (doc.sections || [])) {
        const score = scoreSection(section, terms);
        if (score > bestScore) {
          bestScore = score;
          bestSection = section;
        }
      }
      if (bestSection && bestScore > 0) {
        const text = [`# ${doc.title}`, doc.url, bestSection.heading ? `## ${bestSection.heading}` : "", bestSection.md]
          .filter((l) => l !== "").join("\n");
        return { content: [{ type: "text", text }] };
      }
    }
    // Fallback: show all content
    const text = [`# ${doc.title}`, doc.url, "", doc.content]
      .filter((l) => l !== "").join("\n");
    return { content: [{ type: "text", text }] };
  }
);

// ── list_docs ─────────────────────────────────────────────────────────────────
server.tool(
  "list_docs",
  "Lists all available ASAPIO documentation pages with titles and URLs.",
  {},
  async () => {
    const pages = docsIndex;
    const lines = pages.map((p) => `- **${p.title}** → ${p.file}`);
    return {
      content: [{ type: "text", text: `## ASAPIO ACI Documentation (${pages.length} pages)\n\n${lines.join("\n")}` }],
    };
  }
);

// ── get_doc_sections ──────────────────────────────────────────────────────────
server.tool(
  "get_doc_sections",
  "Returns the outline (headings) of a documentation page without loading the full content.",
  {
    path: z.string().describe("Path or full URL of the page"),
  },
  async ({ path: docPath }) => {
    // Only use local docs
    let html = readLocalDoc(docPath);
    let url = docPath;
    if (!html) {
      return { content: [{ type: "text", text: `Document '${docPath}' not found locally.` }] };
    }
    const doc  = parseDoc(html, url);
    const text = [`# ${doc.title} – Outline`, "",
      doc.headings.length ? doc.headings.map((h) => `- ${h}`).join("\n") : "No headings found."
    ].join("\n");
    return { content: [{ type: "text", text }] };
  }
);

// ── reload_docs ───────────────────────────────────────────────────────────────
server.tool(
  "reload_docs",
  "Clears the cache and reloads all documentation pages from asapio.com/docs/. Call this after publishing website updates.",
  {},
  async () => {
    indexCache = null;
    const pages = await buildIndex(true);
    return {
      content: [{ type: "text", text: `Cache cleared. ${pages.length} pages reloaded from local docs/ folder.` }],
    };
  }
);

// ─── Start ────────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
