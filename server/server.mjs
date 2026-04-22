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
let overviewMap = null;
function loadOverviewMap() {
  const overviewPath = path.join(LOCAL_DOCS_DIR, "overview.md");
  if (!fs.existsSync(overviewPath)) return null;
  const md = fs.readFileSync(overviewPath, "utf-8");
  // Simple parser: map [Title](file.md) to file.md, collect section headings
  const lines = md.split(/\r?\n/);
  const map = {};
  let currentFile = null;
  for (const line of lines) {
    const m = line.match(/^###? \[(.+?)\]\((.+?\.md)\)/);
    if (m) {
      currentFile = m[2];
      map[currentFile] = { title: m[1], sections: [] };
      continue;
    }
    const sec = line.match(/^- \*\*(.+?)\*\*/);
    if (currentFile && sec) {
      map[currentFile].sections.push(sec[1]);
    }
  }
  return map;
}

function findDocsForQuery(query) {
  if (!overviewMap) overviewMap = loadOverviewMap();
  if (!overviewMap) return [];
  const q = query.toLowerCase();
  // Score by title and section match
  const scored = Object.entries(overviewMap).map(([file, { title, sections }]) => {
    let score = 0;
    if (title.toLowerCase().includes(q)) score += 10;
    for (const s of sections) {
      if (s.toLowerCase().includes(q)) score += 5;
    }
    return { file, title, score };
  });
  return scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score);
}

/**
 * ASAPIO ACI Docs – MCP Server (mcp-aci-docs)
 *
 */


// ─── Configuration ────────────────────────────────────────────────────────────

const CACHE_TTL_MS  = parseInt(process.env.CACHE_TTL_SECONDS || "3600") * 1000; // default: 1 hour
// Use docs folder inside the extension directory
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const LOCAL_DOCS_DIR = path.resolve(__dirname, "../docs");
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

// ─── Build index ──────────────────────────────────────────────────────────────

async function buildIndex(force = false) {
  if (indexCache) return indexCache.pages;

  // Only use local docs, ignore online
  const localFiles = listLocalDocs();
  if (localFiles.length === 0) {
    indexCache = { pages: [], builtAt: Date.now() };
    return [];
  }
  const pages = localFiles.map(f => {
    const html = readLocalDoc(f);
    const url = `file://${f}`;
    return parseDoc(html, url);
  });
  indexCache = { pages, builtAt: Date.now() };
  return pages;
}

// ─── Search & Section Scoring ────────────────────────────────────────────────

function scoreSection(section, terms) {
  let score = 0;
  const text = section.heading + " " + (section.html ? parse(section.html).text : "");
  for (const t of terms) {
    if (section.heading && section.heading.toLowerCase().includes(t)) score += 10;
    const re = new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
    const hits = (text.toLowerCase().match(re) || []).length;
    score += Math.min(hits, 20);
  }
  return score;
}

async function searchDocs(query, limit = 5) {
  // Use overview map to prioritize relevant docs
  const overviewHits = findDocsForQuery(query);
  let prioritizedFiles = overviewHits.map(h => path.join(LOCAL_DOCS_DIR, h.file));
  // Fallback: all docs
  if (prioritizedFiles.length === 0) {
    prioritizedFiles = listLocalDocs();
  }
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const results = [];
  for (const f of prioritizedFiles) {
    const md = readLocalDoc(f);
    if (!md) continue;
    const url = `file://${f}`;
    const p = parseDoc(md, url);
    let bestSection = null;
    let bestScore = 0;
    for (const section of (p.sections || [])) {
      const score = scoreSection(section, terms);
      if (score > bestScore) {
        bestScore = score;
        bestSection = section;
      }
    }
    if (bestSection && bestScore > 0) {
      results.push({ ...p, bestSection, score: bestScore });
    }
    if (results.length >= limit) break;
  }
  return results.sort((a, b) => b.score - a.score).slice(0, limit);
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
      return { content: [{ type: "text", text: `No results found for: "${query}"` }] };
    }
    // Show only the most relevant section (render markdown)
    const text = results.map((doc, i) => [
      `### ${i + 1}. ${doc.title}`,
      `**File:** ${doc.path}`,
      doc.headings.length ? `**Sections:** ${doc.headings.slice(0, 6).join(" · ")}` : "",
      doc.bestSection.heading ? `**Section:** ${doc.bestSection.heading}` : "",
      doc.bestSection.md || ""
    ].filter(Boolean).join("\n")).join("\n\n---\n\n");

    return { content: [{ type: "text", text: `${results.length} result(s) for "${query}":\n\n${text}` }] };
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
    const pages = await buildIndex();
    const lines = pages.map((p) => `- **${p.title}** → ${p.url}`);
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
