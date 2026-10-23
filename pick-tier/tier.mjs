#!/usr/bin/env node
// Decide the tier of a change, from a diff or from a list of files.
//
//   node tier.mjs --base origin/master            measure the branch diff
//   node tier.mjs --files a.vue,b.ts              estimate from a file list
//   node tier.mjs --base origin/master --out .plans/task/tier.md
//
// Prints the tier.md content. pick-tier adds judgement on top: a
// user-declared tier, and escalation when a step finds more than it measured.
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : null;
};
const base = opt("--base");
const filesArg = opt("--files");
const out = opt("--out");
const end = opt("--end");

if (!base && !filesArg) {
  console.error("usage: tier.mjs --base <ref> [--end <ref>] | --files <a,b,c> [--out <file>]");
  process.exit(2);
}

const IGNORED = [
  /(^|\/)node_modules\//,
  /(^|\/)\.nuxt\//,
  /(^|\/)\.output\//,
  /(^|\/)dist\//,
  /(^|\/)build\//,
  /(^|\/)\.harness\/\.runtime\//,
  /package-lock\.json$/,
  /pnpm-lock\.yaml$/,
  /yarn\.lock$/,
  /(^|\/)package\.json$/,
];
const DOC = /\.(md|mdx|rst|txt)$/i;
const TEST = /(\.test\.|\.spec\.|^tests?\/|__tests__\/|\/tests?\/)(\w*\.)?(ts|tsx|js|jsx|vue)$/i;
const LOCK = /(^|\/)(package-lock\.json|pnpm-lock\.yaml|yarn\.lock)$/i;

// Tier L territory: authentication, authorization, the server, the database,
// the pipeline. Routing, middleware, pages and components are everyday work:
// a routing change with tests is tier M, not tier L.
const SENSITIVE = [
  /(^|\/)[^/]*auth[^/]*(\/|$)/i,
  /(^|\/)(login|session|session-?storage|permission|permissions|role|roles|acl)(\/|$)/i,
  /(^|\/)server\/api\//i,
  /(^|\/)(migrations?|schema|seed)(\/|$)/i,
  /(^|\/)\.env/i,
  /(^|\/)docker-compose/i,
  /(^|\/)Dockerfile/i,
  /(^|\/)Jenkinsfile$/i,
  /(^|\/)\.github\/workflows\//i,
  /(^|\/)\.gitea\/workflows\//i,
  /(^|\/)\.gitlab-ci\.yml$/i,
];
const USER_VISIBLE = [
  /(^|\/)(pages|views|components|features|app|templates|styles|ui)(\/|$)/i,
  /\.(vue|jsx|tsx|svelte|html|css|scss)$/i,
];

const isSensitive = (f) => SENSITIVE.some((re) => re.test(f));
const isUserVisible = (f) => USER_VISIBLE.some((re) => re.test(f));
const isDoc = (f) => DOC.test(f);
const isTest = (f) => TEST.test(f);

let files = [];
let lines = 0;
const perFile = new Map();
let mode = "estimate";
let baseLabel = "";

if (base) {
  mode = "measure";
  baseLabel = base;
  const range = end
    ? `${base}...${end}`
    : `${base}...HEAD`;
  const outp = execSync(
    `git diff --numstat ${JSON.stringify(range)}`,
    { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }
  );
  for (const line of outp.split("\n")) {
    const m = line.match(/^(\d+|-)\t(\d+|-)\t(.+)$/);
    if (!m) continue;
    const f = m[3];
    if (IGNORED.some((re) => re.test(f))) continue;
    files.push(f);
    const changed = (m[1] === "-" ? 0 : Number(m[1])) + (m[2] === "-" ? 0 : Number(m[2]));
    lines += changed;
    perFile.set(f, (perFile.get(f) || 0) + changed);
  }
  // Uncommitted work counts too.
  const dirty = end
    ? ""
    : execSync("git diff --numstat HEAD", {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      });
  for (const line of dirty.split("\n")) {
    const m = line.match(/^(\d+|-)\t(\d+|-)\t(.+)$/);
    if (!m) continue;
    const f = m[3];
    if (IGNORED.some((re) => re.test(f))) continue;
    if (!files.includes(f)) files.push(f);
    const changed = (m[1] === "-" ? 0 : Number(m[1])) + (m[2] === "-" ? 0 : Number(m[2]));
    lines += changed;
    perFile.set(f, (perFile.get(f) || 0) + changed);
  }
} else {
  files = filesArg
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean)
    .filter((f) => !IGNORED.some((re) => re.test(f)));
}

const sensitive = files.filter(isSensitive);
const visible = files.filter(isUserVisible);
const tests = files.filter(isTest);
const docs = files.filter(isDoc);
const sourceWithoutTest = files.filter(
  (f) => !isTest(f) && !isDoc(f) && !LOCK.test(f)
);
// A file that changed by a line or two is not a big change, however many
// files there are. A file with real work in it is.
const SUBSTANTIAL_LINES = 10;
const substantial =
  perFile.size > 0
    ? sourceWithoutTest.filter((f) => (perFile.get(f) || 0) >= SUBSTANTIAL_LINES)
    : [];

const docOnly = files.length > 0 && docs.length === files.length;
const sourceFiles = files.filter((f) => !isTest(f) && !isDoc(f) && !LOCK.test(f));
const smallAndSafe = sourceFiles.length <= 1 && sensitive.length === 0;
const hasTestCoverage = tests.length > 0 || sourceFiles.length === 0;

let tier;
let why;
if (docOnly) {
  tier = "S";
  why = "documentation only";
} else if (smallAndSafe && hasTestCoverage) {
  tier = "S";
  why = "one source file, no sensitive path, and it has a test";
} else if (
  sensitive.length === 0 &&
  (perFile.size > 0 ? substantial.length <= 5 : sourceFiles.length <= 8)
) {
  tier = "M";
  why = perFile.size > 0
    ? `${substantial.length} substantial source files, no sensitive path`
    : `${sourceFiles.length} source files, no sensitive path`;
} else {
  tier = "L";
  why =
    sensitive.length > 0
      ? `touches ${sensitive[0]}`
      : perFile.size > 0
        ? `${substantial.length} substantial source files`
        : `${sourceFiles.length} source files`;
}

const STEPS = {
  S: [
    "Build (implement, unit test, lint, commit) — sonnet",
    "Push and merge-request link — sonnet",
    "CI status — sonnet",
  ],
  M: [
    "Build — sonnet",
    "Context pack — sonnet",
    "Correctness review (one angle) — sonnet",
    "Falsify — sonnet",
    "Fix, once — opus",
    "Verify — sonnet",
    "Push and merge-request link — sonnet",
    "CI status — sonnet",
  ],
  L: [
    "Build — sonnet",
    "Context pack — sonnet",
    "Review (four angles, blast radius) — sonnet",
    "Falsify — sonnet",
    "Fix, once — opus",
    "Simplify and deslop — sonnet",
    "Spec check — sonnet",
    "Verify — sonnet",
    "Push and merge-request link — sonnet",
    "Browser walkthrough — sonnet",
    "CI status — sonnet",
  ],
};
const SKIPPED = {
  S: ["plan", "context pack", "review", "browser walkthrough"],
  M: ["four-angle interrogate", "blast radius", "browser walkthrough", "simplify", "spec check"],
  L: [],
};

const md = `# Tier

TIER: ${tier}
MODE: ${mode}
BASE: ${baseLabel || "(file list)"}
FILES: ${files.length}
SOURCE: ${sourceFiles.length}
LINES: ${lines > 0 ? `+${lines}` : "(not measured)"}

## Signals
- why: ${why}
- sensitive: ${sensitive.length ? sensitive.join(", ") : "none"}
- user-visible: ${visible.length ? visible.join(", ") : "none"}
- tests: ${tests.length ? tests.join(", ") : "none"}
- changed source files without a test: ${
    sourceWithoutTest.length ? sourceWithoutTest.join(", ") : "none"
  }
- substantial source files (${SUBSTANTIAL_LINES}+ changed lines): ${
    substantial.length ? substantial.join(", ") : "none"
  }

## Steps
${STEPS[tier].map((s, i) => `${i + 1}. ${s}`).join("\n")}

## Skipped
${SKIPPED[tier].length ? SKIPPED[tier].map((s) => `- ${s}`).join("\n") : "- none"}
`;

if (out) {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, md);
  console.log(`tier ${tier} -> ${out}`);
} else {
  process.stdout.write(md);
}
