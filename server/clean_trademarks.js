#!/usr/bin/env node
// Remove all trademark and registered signs from docs_index.json
const fs = require('fs');
const path = require('path');

const indexPath = path.resolve(__dirname, 'docs_index.json');
let content = fs.readFileSync(indexPath, 'utf-8');
// Remove ®, ™, ℠, and similar unicode marks
content = content.replace(/[®™℠]/g, '');
fs.writeFileSync(indexPath, content);
console.log('Trademark and registered signs removed from docs_index.json');
