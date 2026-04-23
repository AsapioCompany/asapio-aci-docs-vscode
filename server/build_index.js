// This script builds a persistent search index for ASAPIO documentation.
// Run this at build time to generate docs_index.json in the server directory.

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const DOCS_DIR = path.resolve(__dirname, '../docs');
const OUT_FILE = path.resolve(__dirname, 'docs_index.json');

function listDocs(dir) {
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(f => path.join(dir, f));
}

function parseDoc(md, filePath) {
  const tokens = marked.lexer(md);
  let title = '';
  let headings = [];
  let sections = [];
  let current = null;
  for (const token of tokens) {
    if (token.type === 'heading' && token.depth <= 3) {
      if (current) sections.push(current);
      current = { heading: token.text, md: '', tokens: [] };
      headings.push(token.text);
      if (!title && token.depth === 1) title = token.text;
    }
    if (current) {
      current.md += token.raw || token.text || '';
      current.tokens.push(token);
    }
  }
  if (current) sections.push(current);
  if (!title && headings.length > 0) title = headings[0];
  if (!title) title = path.basename(filePath);
  return { file: filePath, title, headings, sections };
}

function buildIndex() {
  const files = listDocs(DOCS_DIR);
  const index = files.map(f => {
    const md = fs.readFileSync(f, 'utf-8');
    return parseDoc(md, path.relative(DOCS_DIR, f));
  });
  fs.writeFileSync(OUT_FILE, JSON.stringify(index, null, 2));
  console.log(`Index written to ${OUT_FILE}`);
}

buildIndex();
