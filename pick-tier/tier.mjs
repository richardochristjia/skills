#!/usr/bin/env node
// Decide the tier of a change, from a diff or from a list of files.
//
//   node tier.mjs --base origin/master            measure the branch diff
//   node tier.mjs --files a.vue,b.ts              estimate from a file list
//   node tier.mjs --base origin/master --out .plans/task/tier.md
//   node tier.mjs --files a.vue,b.ts --phases 4   count tasks.md phases for the loop
//   node tier.mjs --files a.vue,b.ts --tier L     keep a user-declared tier
//
// Settings come from <repo>/.agents/workflow.json and ~/.agents/workflow.json
// (see CONFIG.md); an invalid file exits 2 naming the key.
//
// --tier is a user-declared tier: the result is the higher of it and the
// computed tier, so a declared tier is never lowered.
// The LOOP: line is a fixed rule on the final tier: tier S or M -> micro; tier
// L with a sensitive path or more than 3 phases -> phased; every other tier L
// -> simple. Prints the tier.md content. pick-tier adds judgement on top:
// escalation when a step finds more than it measured.
import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
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
const phasesArg = opt("--phases");
const phases = phasesArg === null ? 0 : Number(phasesArg);
if (phasesArg !== null && !Number.isInteger(phases)) {
  console.error("--phases takes a whole number");
  process.exit(2);
}
const USAGE =
  "usage: tier.mjs --base <ref> [--end <ref>] | --files <a,b,c> [--phases <n>] [--tier <S|M|L>] [--out <file>]";
const declared = opt("--tier");
if (args.includes("--tier") && !["S", "M", "L"].includes(declared)) {
  console.error("--tier takes S, M or L");
  console.error(USAGE);
  process.exit(2);
}

if (!base && !filesArg) {
  console.error(USAGE);
  process.exit(2);
}

const STEP_IDS = [
  "build", "context-pack", "review", "falsify", "fix", "simplify",
  "spec-check", "verify", "delivery", "browser-walkthrough", "ci-status",
];
const UNSKIPPABLE = ["build", "verify", "delivery"];
const DEFAULTS = {
  models: { default: "sonnet", fix: "opus" },
  orchestrator: { model: "inherit", effort: "high" },
  delivery: "pr",
  tier: { force: null, substantialLines: 10, maxMediumFiles: 5, sensitivePaths: [] },
  loop: null,
  steps: { skip: [] },
  baseBranch: "auto",
  branchPrefix: "",
  fixture: ".harness/",
};

const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const merge = (a, b) => {
  if (!isObj(a) || !isObj(b)) return b;
  const r = { ...a };
  for (const k of Object.keys(b)) r[k] = k in a ? merge(a[k], b[k]) : b[k];
  return r;
};

// Throws "<key>: <problem>"; the caller adds the file.
const validate = (c) => {
  const bad = (key, msg) => {
    throw new Error(`${key}: ${msg}`);
  };
  const keys = (o, key, allowed) => {
    if (!isObj(o)) bad(key || "(top level)", "must be an object");
    for (const k of Object.keys(o)) {
      if (!allowed.includes(k)) bad(key ? `${key}.${k}` : k, "unknown key");
    }
  };
  const str = (v, key) => {
    if (typeof v !== "string" || !v) bad(key, "must be a non-empty string");
  };
  const oneOf = (v, key, list) => {
    if (!list.includes(v)) bad(key, `must be one of ${list.join(", ")}`);
  };
  const posInt = (v, key) => {
    if (!Number.isInteger(v) || v < 1) bad(key, "must be a positive integer");
  };
  keys(c, "", Object.keys(DEFAULTS));
  if ("models" in c) {
    keys(c.models, "models", ["default", ...STEP_IDS]);
    for (const k of Object.keys(c.models)) str(c.models[k], `models.${k}`);
  }
  if ("orchestrator" in c) {
    keys(c.orchestrator, "orchestrator", ["model", "effort"]);
    if ("model" in c.orchestrator) str(c.orchestrator.model, "orchestrator.model");
    if ("effort" in c.orchestrator) {
      oneOf(c.orchestrator.effort, "orchestrator.effort", ["low", "medium", "high", "xhigh", "max"]);
    }
  }
  if ("delivery" in c) oneOf(c.delivery, "delivery", ["pr", "draft-pr", "push", "local"]);
  if ("tier" in c) {
    const t = c.tier;
    keys(t, "tier", Object.keys(DEFAULTS.tier));
    if ("force" in t && t.force !== null) oneOf(t.force, "tier.force", ["S", "M", "L"]);
    if ("substantialLines" in t) posInt(t.substantialLines, "tier.substantialLines");
    if ("maxMediumFiles" in t) posInt(t.maxMediumFiles, "tier.maxMediumFiles");
    if ("sensitivePaths" in t) {
      if (!Array.isArray(t.sensitivePaths)) bad("tier.sensitivePaths", "must be an array of strings");
      t.sensitivePaths.forEach((p, i) => {
        const key = `tier.sensitivePaths[${i}]`;
        str(p, key);
        try {
          new RegExp(p, "i");
        } catch {
          bad(key, `invalid regex ${JSON.stringify(p)}`);
        }
      });
    }
  }
  if ("loop" in c && c.loop !== null) oneOf(c.loop, "loop", ["micro", "simple", "phased"]);
  if ("steps" in c) {
    keys(c.steps, "steps", ["skip"]);
    if ("skip" in c.steps) {
      if (!Array.isArray(c.steps.skip)) bad("steps.skip", "must be an array of step ids");
      for (const id of c.steps.skip) {
        if (!STEP_IDS.includes(id)) bad("steps.skip", `unknown step id ${JSON.stringify(id)}`);
        if (UNSKIPPABLE.includes(id)) bad("steps.skip", `step ${id} cannot be skipped`);
      }
    }
  }
  if ("baseBranch" in c) str(c.baseBranch, "baseBranch");
  if ("branchPrefix" in c && typeof c.branchPrefix !== "string") bad("branchPrefix", "must be a string");
  if ("fixture" in c) {
    str(c.fixture, "fixture");
    if (path.isAbsolute(c.fixture)) bad("fixture", "must be a repo-relative path");
  }
};

let repoRoot = process.cwd();
try {
  repoRoot = execSync("git rev-parse --show-toplevel", {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();
} catch {}
const configPaths = [
  path.join(repoRoot, ".agents", "workflow.json"),
  path.join(os.homedir(), ".agents", "workflow.json"),
].filter((p, i, all) => all.indexOf(p) === i && fs.existsSync(p));
let config = DEFAULTS;
// Lowest first: user file, then repo file.
for (const file of [...configPaths].reverse()) {
  try {
    const c = JSON.parse(fs.readFileSync(file, "utf8"));
    validate(c);
    config = merge(config, c);
  } catch (e) {
    console.error(`workflow config ${file}: ${e.message}`);
    process.exit(2);
  }
}
// A value that differs from the built-in default is marked.
const mark = (v, d) => (JSON.stringify(v) === JSON.stringify(d) ? "" : " (config)");

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

const SENSITIVE_ALL = [
  ...SENSITIVE,
  ...config.tier.sensitivePaths.map((p) => new RegExp(p, "i")),
];
const isSensitive = (f) => SENSITIVE_ALL.some((re) => re.test(f));
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
const SUBSTANTIAL_LINES = config.tier.substantialLines;
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
  (perFile.size > 0
    ? substantial.length <= config.tier.maxMediumFiles
    : sourceFiles.length <= config.tier.maxMediumFiles + 3)
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

const RANK = { S: 0, M: 1, L: 2 };
// The higher of --tier, tier.force and the computed tier wins; the user's word
// is named first on a tie.
const raises = [
  [declared, "declared by the user"],
  [config.tier.force, "forced by config"],
].filter(([t]) => t && RANK[t] > RANK[tier]);
if (raises.length) {
  const [t, who] = raises.reduce((a, b) => (RANK[b[0]] > RANK[a[0]] ? b : a));
  why = `${who} (measured ${tier}: ${why})`;
  tier = t;
}

const computedLoop =
  tier !== "L" ? "micro" : sensitive.length > 0 || phases > 3 ? "phased" : "simple";
const loop = config.loop || computedLoop;
const loopMark = config.loop ? mark(loop, computedLoop) : "";

// Lines the user set by hand survive a rewrite and beat config.
const prev = out && fs.existsSync(out) ? fs.readFileSync(out, "utf8") : "";
const userSteps = new Map();
for (const m of prev.matchAll(/^\d+\. (.+?) — .+ \(user\)$/gm)) userSteps.set(m[1], m[0].replace(/^\d+\. /, ""));
const userLoop = prev.match(/^LOOP: (.+) \(user\)$/m);

const STEPS = {
  S: [
    ["build", "Build (implement, unit test, lint, commit)"],
    ["delivery", "Push and merge-request link"],
    ["ci-status", "CI status"],
  ],
  M: [
    ["build", "Build"],
    ["context-pack", "Context pack"],
    ["review", "Correctness review (one angle)"],
    ["falsify", "Falsify"],
    ["fix", "Fix, once"],
    ["verify", "Verify"],
    ["delivery", "Push and merge-request link"],
    ["ci-status", "CI status"],
  ],
  L: [
    ["build", "Build"],
    ["context-pack", "Context pack"],
    ["review", "Review (four angles, blast radius)"],
    ["falsify", "Falsify"],
    ["fix", "Fix, once"],
    ["simplify", "Simplify and deslop"],
    ["spec-check", "Spec check"],
    ["verify", "Verify"],
    ["delivery", "Push and merge-request link"],
    ["browser-walkthrough", "Browser walkthrough"],
    ["ci-status", "CI status"],
  ],
};
const SKIPPED = {
  S: ["plan", "context pack", "review", "browser walkthrough"],
  M: ["four-angle interrogate", "blast radius", "browser walkthrough", "simplify", "spec check"],
  L: [],
};

const skip = new Set(config.steps.skip);
if (skip.has("review")) skip.add("falsify").add("fix");
if (config.delivery === "local") skip.add("ci-status");
const skippedNow = [];
const stepLines = [];
for (const [id, label] of STEPS[tier]) {
  if (skip.has(id)) {
    skippedNow.push(id.replace("-", " "));
    continue;
  }
  const dflt = id === "fix" ? DEFAULTS.models.fix : DEFAULTS.models.default;
  const model = config.models[id] || config.models.default;
  stepLines.push(userSteps.get(label) || `${label} — ${model}${mark(model, dflt)}`);
}
const skippedAll = [...SKIPPED[tier], ...skippedNow];

const md = `# Tier

TIER: ${tier}
LOOP: ${userLoop ? `${userLoop[1]} (user)` : `${loop}${loopMark}`}
MODE: ${mode}
BASE: ${baseLabel || "(file list)"}
FILES: ${files.length}
SOURCE: ${sourceFiles.length}
LINES: ${lines > 0 ? `+${lines}` : "(not measured)"}
CONFIG: ${configPaths.length ? configPaths.join(", ") : "none"}
DELIVERY: ${config.delivery}${mark(config.delivery, DEFAULTS.delivery)}
ORCHESTRATOR: ${config.orchestrator.model} ${config.orchestrator.effort}${mark(config.orchestrator, DEFAULTS.orchestrator)}
BASE_BRANCH: ${config.baseBranch}${mark(config.baseBranch, DEFAULTS.baseBranch)}
BRANCH_PREFIX: ${config.branchPrefix || "none"}${mark(config.branchPrefix, DEFAULTS.branchPrefix)}
FIXTURE: ${config.fixture}${mark(config.fixture, DEFAULTS.fixture)}

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
${stepLines.map((s, i) => `${i + 1}. ${s}`).join("\n")}

## Skipped
${skippedAll.length ? skippedAll.map((s) => `- ${s}`).join("\n") : "- none"}
`;

if (out) {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, md);
  console.log(`tier ${tier} -> ${out}`);
} else {
  process.stdout.write(md);
}
