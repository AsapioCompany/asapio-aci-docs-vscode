#!/usr/bin/env node

/**
 * ASAPIO ACI Docs – MCP Server (mcp-aci-docs)
 *
 * Fetches documentation directly from https://asapio.com/docs/
 * No local docs folder required. Updates published to the website
 * are immediately available to all team members.
 *
 * Compatible with GitHub Copilot in VS Code and Claude Desktop (stdio transport).
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

const DOCS_BASE_URL = (process.env.DOCS_BASE_URL || "https://asapio.com/docs").replace(/\/$/, "");
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

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

function fetchUrl(url, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    if (redirectCount > 5) return reject(new Error(`Too many redirects: ${url}`));

    const client = url.startsWith("https") ? https : http;
    const req = client.get(url, {
      headers: {
        "User-Agent": "mcp-aci-docs/2.0 (ASAPIO internal tool)",
        Accept: "text/html,application/xhtml+xml",
      },
    }, (res) => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        const next = res.headers.location.startsWith("http")
          ? res.headers.location
          : new URL(res.headers.location, url).href;
        res.resume();
        return resolve(fetchUrl(next, redirectCount + 1));
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode}: ${url}`));
      }
      let data = "";
      res.setEncoding("utf-8");
      res.on("data", (c) => (data += c));
      res.on("end",  () => resolve(data));
      res.on("error", reject);
    });
    req.on("error", reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error(`Request timed out: ${url}`)); });
  });
}

// ─── Cache ────────────────────────────────────────────────────────────────────

const pageCache = new Map(); // url → { html, fetchedAt }
let   indexCache = null;     // { pages, builtAt }

const isFresh = (ts) => Date.now() - ts < CACHE_TTL_MS;

async function fetchCached(url) {
  const hit = pageCache.get(url);
  if (hit && isFresh(hit.fetchedAt)) return hit.html;
  const html = await fetchUrl(url);
  pageCache.set(url, { html, fetchedAt: Date.now() });
  return html;
}

// ─── Link extraction ──────────────────────────────────────────────────────────

function extractDocLinks(html, baseUrl) {
  const root  = parse(html);
  const links = new Set();

  root.querySelectorAll("a[href]").forEach((a) => {
    const href = (a.getAttribute("href") || "").trim();
    if (!href || href.startsWith("#") || href.startsWith("mailto:")) return;

    let absolute;
    if (href.startsWith("http")) {
      absolute = href;
    } else if (href.startsWith("/")) {
      const b = new URL(baseUrl);
      absolute = `${b.protocol}//${b.host}${href}`;
    } else {
      absolute = `${baseUrl.replace(/\/?$/, "/")}${href}`;
    }

    // Only keep links within DOCS_BASE_URL
    if (absolute.startsWith(DOCS_BASE_URL)) {
      links.add(absolute.split("#")[0]);
    }
  });

  return [...links];
}

// ─── HTML → Document ──────────────────────────────────────────────────────────

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

  const mainEl  = root.querySelector("main, article, .content, #content, .docs-content, body");
  const content = (mainEl || root).text.replace(/\s+/g, " ").trim().slice(0, 8000);
  const headings = root.querySelectorAll("h1, h2, h3").map((h) => h.text.trim()).filter(Boolean);
  const path = url.replace(DOCS_BASE_URL, "").replace(/^\//, "") || "index";

  return { url, path, title, description, content, headings };
}

// ─── Build index ──────────────────────────────────────────────────────────────

async function buildIndex(force = false) {
  if (indexCache && isFresh(indexCache.builtAt) && !force) return indexCache.pages;

  // Prefer local docs if available
  const localFiles = listLocalDocs();
  if (localFiles.length > 0) {
    const pages = localFiles.map(f => {
      const html = readLocalDoc(f);
      // Use file name as path
      const url = `file://${f}`;
      return parseDoc(html, url);
    });
    indexCache = { pages, builtAt: Date.now() };
    return pages;
  }
  // Otherwise fallback to online
  const indexHtml = await fetchCached(DOCS_BASE_URL + "/");
  const links     = extractDocLinks(indexHtml, DOCS_BASE_URL + "/");
  const unique    = [...new Set([DOCS_BASE_URL + "/", ...links])];
  // Fetch in parallel, max 8 concurrent requests
  const pages = [];
  for (let i = 0; i < unique.length; i += 8) {
    const batch   = unique.slice(i, i + 8);
    const results = await Promise.allSettled(
      batch.map(async (url) => parseDoc(await fetchCached(url), url))
    );
    results.forEach((r) => { if (r.status === "fulfilled") pages.push(r.value); });
  }
  indexCache = { pages, builtAt: Date.now() };
  return pages;
}

// ─── Search ───────────────────────────────────────────────────────────────────

function scoreDoc(doc, terms) {
  let score = 0;
  for (const t of terms) {
    if (doc.title.toLowerCase().includes(t))                   score += 10;
    if (doc.description.toLowerCase().includes(t))             score += 5;
    if (doc.headings.some((h) => h.toLowerCase().includes(t))) score += 7;
    const re   = new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
    const hits = (doc.content.toLowerCase().match(re) || []).length;
    score += Math.min(hits, 20);
  }
  return score;
}

async function searchDocs(query, limit = 5) {
  const pages = await buildIndex();
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  return pages
    .map((p) => ({ ...p, score: scoreDoc(p, terms) }))
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
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
    const text = results.map((doc, i) => [
      `### ${i + 1}. ${doc.title}`,
      `**URL:** ${doc.url}`,
      doc.description ? `**Description:** ${doc.description}` : "",
      doc.headings.length ? `**Sections:** ${doc.headings.slice(0, 6).join(" · ")}` : "",
      `**Excerpt:** ${doc.content.slice(0, 400).trim()}…`,
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
  async ({ path: docPath }, { tools }) => {
    // Try local first
    let html = readLocalDoc(docPath);
    let url = docPath;
    if (!html) {
      // Use MCP tool to ask user for permission
      if (tools && tools.allow_online_fallback) {
        const resp = await tools.allow_online_fallback({ docPath });
        const answer = (resp && resp.content && resp.content[0] && resp.content[0].text) ? resp.content[0].text.trim().toLowerCase() : "";
        if (!/^y(es)?$/.test(answer)) {
          return { content: [{ type: "text", text: `Cancelled. '${docPath}' not fetched from website.` }] };
        }
      }
      url  = docPath.startsWith("http") ? docPath : `${DOCS_BASE_URL}/${docPath.replace(/^\//, "")}`;
      html = await fetchCached(url);
    }
    const doc  = parseDoc(html, url);
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
    const url  = docPath.startsWith("http") ? docPath : `${DOCS_BASE_URL}/${docPath.replace(/^\//, "")}`;
    const html = await fetchCached(url);
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
    pageCache.clear();
    indexCache = null;
    const pages = await buildIndex(true);
    return {
      content: [{ type: "text", text: `Cache cleared. ${pages.length} pages reloaded from ${DOCS_BASE_URL}/` }],
    };
  }
);

// ─── Start ────────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
