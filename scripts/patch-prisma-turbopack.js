#!/usr/bin/env node
/**
 * This script patches the Prisma generated files to add Turbopack ignore comments
 * to dynamic filesystem access calls that cause whole-project tracing.
 * 
 * Run this after `prisma generate` or add it as a postinstall script.
 */

const fs = require('fs');
const path = require('path');

// Function to patch a file by replacing patterns with turbopack ignore comments
function patchFile(filePath, replacements) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  for (const { search, replace } of replacements) {
    const newContent = content.replace(search, replace);
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Patched: ${filePath}`);
  } else {
    console.log(`✓ No changes needed: ${filePath}`);
  }

  return modified;
}

console.log('Patching Prisma generated files for Turbopack compatibility...\n');

let totalPatched = 0;

// Patch index.js
const indexFile = path.join(__dirname, '../src/lib/generated/prisma/index.js');
const indexReplacements = [
  {
    // Fix: fs.existsSync(path.join(process.cwd(), altPath, 'schema.prisma'))
    search: 'fs.existsSync(path.join(process.cwd(), altPath, \'schema.prisma\'))',
    replace: 'fs.existsSync(path.join(/*turbopackIgnore: true*/ process.cwd(), altPath, \'schema.prisma\'))'
  },
  {
    // Fix: config.dirname = path.join(process.cwd(), alternativePath)
    search: 'config.dirname = path.join(process.cwd(), alternativePath)',
    replace: 'config.dirname = path.join(/*turbopackIgnore: true*/ process.cwd(), alternativePath)'
  }
];

if (patchFile(indexFile, indexReplacements)) {
  totalPatched++;
}

// Patch library.js - this file is minified, so we need to handle it carefully
const libraryFile = path.join(__dirname, '../src/lib/generated/prisma/runtime/library.js');
const libraryReplacements = [
  {
    // Fix: Mi.resolve(process.cwd(),".env.vault")
    search: 'Mi.resolve(process.cwd(),".env.vault")',
    replace: 'Mi.resolve(/*turbopackIgnore: true*/ process.cwd(),".env.vault")'
  },
  {
    // Fix: Mi.resolve(process.cwd(),".env")
    search: 'Mi.resolve(process.cwd(),".env")',
    replace: 'Mi.resolve(/*turbopackIgnore: true*/ process.cwd(),".env")'
  },
  {
    // Fix: return Fi.existsSync(r)?r:null
    search: 'return Fi.existsSync(r)?r:null',
    replace: 'return Fi.existsSync(/*turbopackIgnore: true*/ r)?r:null'
  }
];

if (patchFile(libraryFile, libraryReplacements)) {
  totalPatched++;
}

console.log(`\n✅ Done! Patched files.`);
