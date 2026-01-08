#!/usr/bin/env node
const fs = require('fs');
const cp = require('child_process');
const path = require('path');

const root = process.cwd();
const pkgPath = path.join(root, 'package.json');

function getInstalledVersions() {
  const json = cp.execSync('npm ls --depth=0 --json', { stdio: ['ignore', 'pipe', 'inherit'] }).toString();
  const ls = JSON.parse(json);
  const map = Object.create(null);
  for (const [name, info] of Object.entries(ls.dependencies || {})) {
    if (info && typeof info.version === 'string') {
      map[name] = info.version;
    }
  }
  return map;
}

function pinRanges(obj, versions) {
  if (!obj) return;
  for (const key of Object.keys(obj)) {
    const installed = versions[key];
    if (installed) {
      obj[key] = installed;
    } else {
      // If not installed (rare), strip leading range chars like ^ ~ *
      obj[key] = String(obj[key]).replace(/^[^0-9]*/, '');
    }
  }
}

(function main() {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const versions = getInstalledVersions();
  pinRanges(pkg.dependencies, versions);
  pinRanges(pkg.devDependencies, versions);
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  console.log('Pinned versions for', Object.keys(pkg.dependencies||{}).length, 'dependencies and', Object.keys(pkg.devDependencies||{}).length, 'devDependencies');
})();
