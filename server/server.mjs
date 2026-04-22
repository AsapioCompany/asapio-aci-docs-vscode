#!/usr/bin/env node

/**
 * ASAPIO ACI Docs – MCP Server (mcp-aci-docs)
 *
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { parse } from "node-html-parser";
import https from "https";
import http from "http";
import fs from "fs";
import path from "path";

// ─── Configuration ────────────────────────────────────────────────────────────

const CACHE_TTL_MS  = parseInt(process.env.CACHE_TTL_SECONDS || "3600") * 1000; // default: 1 hour
const LOCAL_DOCS_DIR = path.resolve(process.cwd(), "../docs");
// ─── Local Docs Helpers ─────────────────────────────────────────────────────

function listLocalDocs() {
  if (!fs.existsSync(LOCAL_DOCS_DIR)) return [];
  return fs.readdirSync(LOCAL_DOCS_DIR)
    .filter(f => f.endsWith(".html"))
    .map(f => path.join(LOCAL_DOCS_DIR, f));
}

function readLocalDoc(docPath) {
  const fullPath = path.isAbsolute(docPath)
    ? docPath
    : path.join(LOCAL_DOCS_DIR, docPath.replace(/^\/+/, ""));
  if (fs.existsSync(fullPath)) {
    let html = fs.readFileSync(fullPath, "utf-8");
    // Embed images as base64
    html = html.replace(/<img\s+[^>]*src=["']([^"']+)["'][^>]*>/gi, (match, src) => {
      // Only embed relative images (not http/https/data)
      if (/^(https?:|data:)/i.test(src)) return match;
      // Resolve image path relative to doc file
      const imgPath = path.resolve(path.dirname(fullPath), src);
      if (fs.existsSync(imgPath)) {
        const ext = path.extname(imgPath).slice(1).toLowerCase();
        const mime = ext === "svg" ? "image/svg+xml" : `image/${ext}`;
        const data = fs.readFileSync(imgPath);
        const base64 = data.toString("base64");
        const dataUrl = `data:${mime};base64,${base64}`;
        return match.replace(src, dataUrl);
      }
      return match;
    });
    return html;
  }
  return null;
}

// ─── Cache ────────────────────────────────────────────────────────────────────

let   indexCache = null;     // { pages, builtAt }

// ─── Link extraction ──────────────────────────────────────────────────────────


// ─── HTML → Document & Section Extraction ────────────────────────────────────

function parseDoc(html, url) {
  const root = parse(html);

  const title =
    root.querySelector("title")?.text?.trim() ||
    root.querySelector("h1")?.text?.trim() ||
    url.split("/").filter(Boolean).pop() ||
    url;

  const description =
    root.querySelector('meta[name="description"]')?.getAttribute("content") ||
    root.querySelector('meta[property="og:description"]')?.getAttribute("content") ||
    "";

  for (const sel of ["nav","header","footer","script","style",
                      ".sidebar","#sidebar",".nav","#nav",".menu","#menu"]) {
    root.querySelectorAll(sel).forEach((el) => el.remove());
  }

  const mainEl  = root.querySelector("main, article, .content, #content, .docs-content, body") || root;
  // Extract sections: group by h1/h2/h3, or fallback to paragraphs
  let sections = [];
  let current = null;
  mainEl.childNodes.forEach((node) => {
    if (!node.tagName) return;
    const tag = node.tagName.toLowerCase();
    if (["h1","h2","h3"].includes(tag)) {
      if (current) sections.push(current);
      current = { heading: node.text.trim(), html: "", nodes: [] };
    }
    if (current) {
      current.html += node.toString();
      current.nodes.push(node);
    }
  });
  if (current) sections.push(current);
  // If no headings, fallback to paragraphs
  if (sections.length === 0) {
    mainEl.querySelectorAll("p,li,div").forEach((el) => {
      const text = el.text.trim();
      if (text.length > 0) {
        sections.push({ heading: "", html: el.toString(), nodes: [el] });
      }
    });
  }
  // Fallback: whole content
  if (sections.length === 0) {
    sections.push({ heading: title, html: mainEl.toString(), nodes: [mainEl] });
  }

  const content = mainEl.text.replace(/\s+/g, " ").trim().slice(0, 8000);
  const headings = root.querySelectorAll("h1, h2, h3").map((h) => h.text.trim()).filter(Boolean);
  const path = url;

  return { url, path, title, description, content, headings, sections };
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
  const pages = await buildIndex();
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  // For each page, find best section
  const results = [];
  for (const p of pages) {
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
    // Show only the most relevant section (with images)
    const text = results.map((doc, i) => [
      `### ${i + 1}. ${doc.title}`,
      `**URL:** ${doc.url}`,
      doc.description ? `**Description:** ${doc.description}` : "",
      doc.headings.length ? `**Sections:** ${doc.headings.slice(0, 6).join(" · ")}` : "",
      doc.bestSection.heading ? `**Section:** ${doc.bestSection.heading}` : "",
      doc.bestSection.html,
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
    let html = readLocalDoc(docPath);
    let url = docPath;
    if (!html) {
      return { content: [{ type: "text", text: `Document '${docPath}' not found locally.` }] };
    }
    const doc  = parseDoc(html, url);
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
        const text = [`# ${doc.title}`, doc.url, doc.description ? `> ${doc.description}` : "", bestSection.heading ? `## ${bestSection.heading}` : "", bestSection.html]
          .filter((l) => l !== "").join("\n");
        return { content: [{ type: "text", text }] };
      }
    }
    // Fallback: show all content
    const text = [`# ${doc.title}`, doc.url, doc.description ? `> ${doc.description}` : "", "", doc.content]
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
