#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const forbidden = [
  /@contextecf\/(?:engine|boundary|assembly-core|learning|distillation|iqo)/,
  /packages\/(?:engine|boundary|assembly-core)/,
  /\bDyadHash\b/,
  /\bIQO\b/,
  /\bESG\b/,
  /sufficiency.*weight/i,
  /learning.*rate/i,
];

const files = [];
walk(join(root, 'src'));

const findings = [];
for (const file of files) {
  const content = readFileSync(file, 'utf8');
  for (const pattern of forbidden) {
    if (pattern.test(content)) {
      findings.push(`${file}: ${pattern}`);
    }
  }
}

if (findings.length > 0) {
  console.error('Forbidden private ContextECF dependency or internal term found:');
  for (const finding of findings) console.error(`- ${finding}`);
  process.exit(1);
}

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      walk(path);
    } else if (path.endsWith('.ts')) {
      files.push(path);
    }
  }
}
