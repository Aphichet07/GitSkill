import util from "util";
import { exec as execCb } from "child_process";
import fs from "fs/promises";
import path from "path";
import { RepoGroup } from "../models/RepoGroup.js";
import { prisma } from "../lib/prisma.js";
import { generateAIInsight } from "./ai.service.js";

const exec = util.promisify(execCb);

const SKIP_DIRS = new Set([
  "node_modules",
  "dist",
  "build",
  ".git",
  "venv",
  "__pycache__",
  "target",
  "coverage",
]);

const CODE_FILE_REGEX =
  /\.(ts|tsx|js|jsx|go|java|cpp|c|cs|php|dart|swift|py)$/i;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Clamp a value between min and max */
const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

/** Linear penalty: deduct `deductPer` point per issue, capped at `cap` */
const penalty = (count: number, deductPer: number, cap: number) =>
  clamp(count * deductPer, 0, cap);

// ─── Walk ─────────────────────────────────────────────────────────────────────

async function walkDir(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const paths = await Promise.all(
    entries.map(async (entry) => {
      const filePath = path.join(dir, entry.name).replace(/\\/g, "/");
      if (entry.isDirectory()) {
        return SKIP_DIRS.has(entry.name) ? [] : walkDir(filePath);
      }
      return [filePath];
    }),
  );
  return paths.flat();
}

// ─── File Analysis ────────────────────────────────────────────────────────────

interface FileAnalysisResult {
  totalCodeLines: number;
  totalCommentLines: number;
  blankLines: number;
  massiveFiles: number; // files > 300 lines
  veryLargeFiles: number; // files > 600 lines
  nestedLoopCount: number; // O(n²) or worse loops
  hardcodedSecrets: number;
  sqlInjections: number;
  leftoverLogs: number;
  longFunctions: number; // functions > 50 lines
  magicNumbers: number; // bare numeric literals (not 0/1/2)
  missingErrorHandling: number; // async/await without try-catch
  cyclomaticComplexitySum: number; // sum of branch points across functions
  todoComments: number; // TODO / FIXME / HACK markers
  emptycatches: number; // catch blocks with no body
}

const ZERO_RESULT: FileAnalysisResult = {
  totalCodeLines: 0,
  totalCommentLines: 0,
  blankLines: 0,
  massiveFiles: 0,
  veryLargeFiles: 0,
  nestedLoopCount: 0,
  hardcodedSecrets: 0,
  sqlInjections: 0,
  leftoverLogs: 0,
  longFunctions: 0,
  magicNumbers: 0,
  missingErrorHandling: 0,
  cyclomaticComplexitySum: 0,
  todoComments: 0,
  emptycatches: 0,
};

async function analyzeFile(fullPath: string): Promise<FileAnalysisResult> {
  try {
    const rawContent = await fs.readFile(fullPath, "utf-8");
    const lines = rawContent.split("\n");
    const totalCodeLines = lines.length;
    const blankLines = lines.filter((l) => l.trim() === "").length;

    // ── Comment lines ──────────────────────────────────────────────────────
    const commentMatch = rawContent.match(/(\/\/.*|#.*|\/\*[\s\S]*?\*\/)/g);
    const totalCommentLines = commentMatch
      ? commentMatch.reduce((acc, c) => acc + c.split("\n").length, 0)
      : 0;

    // ── Stripped content for structural analysis ───────────────────────────
    const stripped = rawContent
      .replace(/\/\*[\s\S]*?\*\//g, "") // block comments
      .replace(/\/\/.*/g, "") // line comments
      .replace(/#.*/g, "") // python/shell comments
      .replace(/(["'`])(?:(?=(\\?))\2.)*?\1/g, '""'); // string literals → ""

    const strippedLines = stripped.split("\n");

    // ── File size ──────────────────────────────────────────────────────────
    const massiveFiles = totalCodeLines > 300 ? 1 : 0;
    const veryLargeFiles = totalCodeLines > 600 ? 1 : 0;

    // ── Leftover logs ──────────────────────────────────────────────────────
    const logMatch = stripped.match(
      /\b(console\.log|console\.debug|print\s*\(|fmt\.Println|System\.out\.println)\s*\(/g,
    );
    const leftoverLogs = logMatch?.length ?? 0;

    // ── Hardcoded secrets ──────────────────────────────────────────────────
    const secretMatch = rawContent.match(
      /(password|secret|api_key|apikey|token|auth_token|private_key)\s*[:=]\s*['"][a-zA-Z0-9\-_]{8,}['"]/gi,
    );
    const hardcodedSecrets = secretMatch?.length ?? 0;

    // ── SQL injection patterns ─────────────────────────────────────────────
    const sqlMatch = rawContent.match(
      /(SELECT|INSERT|UPDATE|DELETE)[\s\S]*?(WHERE|VALUES)[\s\S]*?['"]\s*\+/gi,
    );
    const sqlInjections = sqlMatch?.length ?? 0;

    // ── Nested loops (fixed: track depth via brace stack) ─────────────────
    let nestedLoopCount = 0;
    {
      const loopRe =
        /\b(for|while)\b|\.(map|forEach|filter|reduce|flatMap)\s*\(/;
      let depth = 0;
      const loopStack: number[] = []; // brace depths where loops opened

      for (const line of strippedLines) {
        if (!line.trim()) continue;
        const opens = (line.match(/\{/g) ?? []).length;
        const closes = (line.match(/\}/g) ?? []).length;
        const hasLoop = loopRe.test(line);

        if (hasLoop) loopStack.push(depth);

        depth += opens;

        // detect nesting: any open loop whose depth < current depth
        if (hasLoop && loopStack.length >= 2) nestedLoopCount++;

        depth -= closes;

        // pop loops that have closed
        while (loopStack.length > 0) {
          const top = loopStack[loopStack.length - 1];
          if (top === undefined || top < depth) break;
          loopStack.pop();
        }
      }
    }

    // ── Long functions (heuristic: consecutive non-blank lines in a block) ─
    let longFunctions = 0;
    {
      const funcRe =
        /\b(function\s+\w+|(?:const|let|var)\s+\w+\s*=\s*(?:async\s*)?\(|(?:async\s+)?(?:public|private|protected)?\s*\w+\s*\()/;
      let inFunc = false;
      let funcLineCount = 0;
      let braceDepth = 0;
      let funcStartDepth = -1;

      for (const line of strippedLines) {
        const opens = (line.match(/\{/g) ?? []).length;
        const closes = (line.match(/\}/g) ?? []).length;

        if (!inFunc && funcRe.test(line) && line.includes("{")) {
          inFunc = true;
          funcStartDepth = braceDepth;
          funcLineCount = 0;
        }

        if (inFunc) {
          funcLineCount++;
          braceDepth += opens - closes;
          if (braceDepth <= funcStartDepth) {
            if (funcLineCount > 50) longFunctions++;
            inFunc = false;
            funcStartDepth = -1;
          }
        } else {
          braceDepth += opens - closes;
        }
      }
    }

    // ── Magic numbers ──────────────────────────────────────────────────────
    // Numbers > 2 that appear bare (not in variable declarations or index access)
    const magicMatch = stripped.match(
      /(?<![a-zA-Z0-9_.=\[])\b([3-9]\d+|\d{3,})\b(?!\s*[:/,\]])/g,
    );
    const magicNumbers = magicMatch?.length ?? 0;

    // ── Cyclomatic complexity (branch points) ──────────────────────────────
    const branchMatch = stripped.match(
      /\b(if|else if|case|catch|for|while|&&|\|\||\?(?!:))\b/g,
    );
    const cyclomaticComplexitySum = branchMatch?.length ?? 0;

    // ── TODO / FIXME / HACK markers ────────────────────────────────────────
    const todoMatch = rawContent.match(/\b(TODO|FIXME|HACK|XXX|BUG)\b/gi);
    const todoComments = todoMatch?.length ?? 0;

    // ── Missing error handling: await without try-catch ────────────────────
    let missingErrorHandling = 0;
    {
      let inTryCatch = false;
      for (const line of strippedLines) {
        if (/\btry\s*\{/.test(line)) inTryCatch = true;
        if (/\bcatch\s*\(/.test(line)) inTryCatch = false;
        if (!inTryCatch && /\bawait\b/.test(line)) missingErrorHandling++;
      }
    }

    // ── Empty catch blocks ─────────────────────────────────────────────────
    const emptyCatchMatch = rawContent.match(/catch\s*\([^)]*\)\s*\{\s*\}/g);
    const emptycatches = emptyCatchMatch?.length ?? 0;

    return {
      totalCodeLines,
      totalCommentLines,
      blankLines,
      massiveFiles,
      veryLargeFiles,
      nestedLoopCount,
      hardcodedSecrets,
      sqlInjections,
      leftoverLogs,
      longFunctions,
      magicNumbers,
      missingErrorHandling,
      cyclomaticComplexitySum,
      todoComments,
      emptycatches,
    };
  } catch {
    return { ...ZERO_RESULT };
  }
}

// ─── Aggregate & Score ────────────────────────────────────────────────────────

async function analyzeCodeQuality(allFiles: string[]) {
  const codeFiles = allFiles
    .filter((f) => CODE_FILE_REGEX.test(f))
    .slice(0, 100);
  const results = await Promise.all(codeFiles.map(analyzeFile));

  const totals = results.reduce<FileAnalysisResult>(
    (acc, r) => ({
      totalCodeLines: acc.totalCodeLines + r.totalCodeLines,
      totalCommentLines: acc.totalCommentLines + r.totalCommentLines,
      blankLines: acc.blankLines + r.blankLines,
      massiveFiles: acc.massiveFiles + r.massiveFiles,
      veryLargeFiles: acc.veryLargeFiles + r.veryLargeFiles,
      nestedLoopCount: acc.nestedLoopCount + r.nestedLoopCount,
      hardcodedSecrets: acc.hardcodedSecrets + r.hardcodedSecrets,
      sqlInjections: acc.sqlInjections + r.sqlInjections,
      leftoverLogs: acc.leftoverLogs + r.leftoverLogs,
      longFunctions: acc.longFunctions + r.longFunctions,
      magicNumbers: acc.magicNumbers + r.magicNumbers,
      missingErrorHandling: acc.missingErrorHandling + r.missingErrorHandling,
      cyclomaticComplexitySum:
        acc.cyclomaticComplexitySum + r.cyclomaticComplexitySum,
      todoComments: acc.todoComments + r.todoComments,
      emptycatches: acc.emptycatches + r.emptycatches,
    }),
    { ...ZERO_RESULT },
  );

  const fileCount = Math.max(codeFiles.length, 1);

  // ── Efficiency score /20 ──────────────────────────────────────────────────
  // Penalise: massive files, very large files, nested loops, long functions,
  //           and high average cyclomatic complexity
  const avgComplexity = totals.cyclomaticComplexitySum / fileCount;
  const efficiencyScore =
    20 -
    penalty(totals.massiveFiles, 1.5, 5) - // up to -5
    penalty(totals.veryLargeFiles, 1.5, 4) - // up to -4 (additive with above)
    penalty(totals.nestedLoopCount, 1.5, 5) - // up to -5
    penalty(totals.longFunctions, 0.5, 3) - // up to -3
    penalty(avgComplexity, 0.15, 3); // up to -3

  // ── Security score /15 ────────────────────────────────────────────────────
  const securityScore =
    15 -
    penalty(totals.hardcodedSecrets, 5, 10) - // critical: up to -10
    penalty(totals.sqlInjections, 5, 5) - // critical: up to -5
    penalty(totals.emptycatches, 0.5, 3) - // silently swallowed errors
    penalty(totals.missingErrorHandling, 0.1, 2); // unguarded awaits

  // ── Habit score /10 ───────────────────────────────────────────────────────
  // Breakdown:
  //   leftoverLogs   → -0.5/log,  cap -3   (console.log ค้างใน production)
  //   magicNumbers   → -0.2/num,  cap -2   (ตัวเลขไม่มีชื่อ อ่านแล้วงง)
  //   todoComments   → -0.25/todo, cap -1  (TODO/FIXME ที่ยังไม่ได้แก้)
  //   commentRatio   → -1 ถึง -4           (น้อยเกิน = อ่านยาก, มากเกิน = noise)
  const commentRatio =
    totals.totalCodeLines > 0
      ? (totals.totalCommentLines / totals.totalCodeLines) * 100
      : 0;

  let habitScore =
    10 -
    penalty(totals.leftoverLogs, 0.5, 3) - // up to -3
    penalty(totals.magicNumbers, 0.2, 2) - // up to -2
    penalty(totals.todoComments, 0.25, 1); // up to -1

  // Comment ratio: ideal 5–30 %
  if (commentRatio < 2) habitScore -= 4;
  else if (commentRatio < 5) habitScore -= 2;
  else if (commentRatio > 40) habitScore -= 2;
  else if (commentRatio > 30) habitScore -= 1;

  return {
    efficiencyScore: Math.max(0, Math.round(efficiencyScore)),
    securityScore: Math.max(0, Math.round(securityScore)),
    habitScore: Math.max(0, Math.round(habitScore)),
    stats: {
      massiveFiles: totals.massiveFiles,
      veryLargeFiles: totals.veryLargeFiles,
      nestedLoopsO2: totals.nestedLoopCount,
      hardcodedSecrets: totals.hardcodedSecrets,
      sqlInjections: totals.sqlInjections,
      leftoverLogs: totals.leftoverLogs,
      longFunctions: totals.longFunctions,
      magicNumbers: totals.magicNumbers,
      missingErrorHandling: totals.missingErrorHandling,
      avgCyclomaticComplexity: Number(avgComplexity.toFixed(1)),
      todoComments: totals.todoComments,
      emptycatches: totals.emptycatches,
      commentRatioPercent: Number(commentRatio.toFixed(1)),
    },
  };
}

// ─── JSCPD ────────────────────────────────────────────────────────────────────

async function runJSCPD(sourceCodePath: string): Promise<number> {
  const reportPath = path.join(sourceCodePath, "jscpd-report.json");
  try {
    await exec(
      `npx --no jscpd "${sourceCodePath}" --reporters json --output "${sourceCodePath}" --silent --ignore "**/*.min.js,**/node_modules/**,**/dist/**,**/.git/**"`,
      { timeout: 30_000 },
    );
    const report = JSON.parse(await fs.readFile(reportPath, "utf-8"));
    return report.statistics?.total?.percentage ?? 0;
  } catch (err) {
    console.error("⚠️ JSCPD CLI Warning:", err);
    return 0;
  }
}

// ─── Dependency extraction ────────────────────────────────────────────────────

async function extractDependencies(allFiles: string[]): Promise<string> {
  const allDepsSet = new Set<string>();

  const pkgPaths = allFiles.filter(
    (f) => path.basename(f).toLowerCase() === "package.json",
  );
  const reqPaths = allFiles.filter(
    (f) => path.basename(f).toLowerCase() === "requirements.txt",
  );
  const goModPaths = allFiles.filter(
    (f) => path.basename(f).toLowerCase() === "go.mod",
  );

  await Promise.all([
    ...pkgPaths.map(async (p) => {
      try {
        const json = JSON.parse(await fs.readFile(p, "utf-8"));
        const deps = {
          ...(json.dependencies ?? {}),
          ...(json.devDependencies ?? {}),
        };
        Object.keys(deps).forEach((d) => allDepsSet.add(d));
      } catch {
        /* skip malformed */
      }
    }),
    ...reqPaths.map(async (p) => {
      try {
        const lines = (await fs.readFile(p, "utf-8")).split("\n");
        lines.forEach((line) => {
          const dep = line.split(/[=<>!]/)[0]?.trim();
          if (dep && !dep.startsWith("#")) allDepsSet.add(dep);
        });
      } catch {
        /* skip */
      }
    }),
    ...goModPaths.map(async (p) => {
      try {
        const lines = (await fs.readFile(p, "utf-8")).split("\n");
        lines.forEach((line) => {
          const m = line.match(/^\s*require\s+(\S+)/);
          if (m?.[1]) allDepsSet.add(m[1]);
        });
      } catch {
        /* skip */
      }
    }),
  ]);

  return Array.from(allDepsSet).join(", ");
}

async function extractReadmes(allFiles: string[]): Promise<string> {
  const readmePaths = allFiles.filter(
    (f) => path.basename(f).toLowerCase() === "readme.md",
  );
  const chunks = await Promise.all(
    readmePaths.map(async (rPath) => {
      try {
        const content = await fs.readFile(rPath, "utf-8");
        return `\n[Repo: ${path.basename(path.dirname(rPath))}]:\n${content.substring(0, 1000)}`;
      } catch {
        return "";
      }
    }),
  );
  return chunks.join("").substring(0, 3000);
}

// ─── Main Service ─────────────────────────────────────────────────────────────

/**
 * Pick the most actionable insight message from the aggregated stats.
 * Priority order: security > performance > habits > docs.
 */
function buildInsightMessage(
  stats: Awaited<ReturnType<typeof analyzeCodeQuality>>["stats"],
): string {
  if ((stats.hardcodedSecrets ?? 0) > 0)
    return `🚨 อันตราย! พบ Credential/Secret หลุดอยู่ในโค้ด ${stats.hardcodedSecrets} จุด — ย้ายเข้า .env ทันที`;
  if ((stats.sqlInjections ?? 0) > 0)
    return `🚨 ความเสี่ยง SQL Injection ${stats.sqlInjections} จุด — ใช้ parameterized query แทนการต่อ string`;
  if ((stats.emptycatches ?? 0) > 2)
    return `⚠️ พบ empty catch block ${stats.emptycatches} จุด — errors ถูกกลืนเงียบ ทำให้ debug ยากมาก`;
  if ((stats.nestedLoopsO2 ?? 0) > 3)
    return `⚠️ Performance! พบลูปซ้อนลูป ${stats.nestedLoopsO2} จุด (O(n²)+) — พิจารณาใช้ Map/Set หรือแยก query`;
  if ((stats.avgCyclomaticComplexity ?? 0) > 15)
    return `⚠️ Complexity สูง (avg ${stats.avgCyclomaticComplexity} branch/file) — แยก function ให้เล็กลง`;
  if ((stats.longFunctions ?? 0) > 5)
    return `ℹ️ พบฟังก์ชันยาวเกิน 50 บรรทัด ${stats.longFunctions} ฟังก์ชัน — ควร refactor ให้อ่านง่ายขึ้น`;
  if ((stats.leftoverLogs ?? 0) > 10)
    return `ℹ️ ลืมลบ console.log() ทิ้งไปถึง ${stats.leftoverLogs} จุด — ควรใช้ logger ที่ปิดใน production ได้`;
  if ((stats.commentRatioPercent ?? 0) < 2)
    return `ℹ️ Comment น้อยกว่า 2% — เพิ่มคำอธิบายให้เพื่อนร่วมทีมอ่านโค้ดได้ง่ายขึ้น`;
  return "✅ โปรเจกต์คุณภาพดี โค้ดคลีนและปลอดภัย";
}

const ScoreService = {
  async analyzeProject(sourceCodePath: string) {
    try {
      console.log(`เริ่มวิเคราะห์ที่: ${sourceCodePath}`);
      const t = (label: string, start: number) =>
        console.log(
          `⏱ ${label}: ${((performance.now() - start) / 1000).toFixed(2)}s`,
        );

      // ── Collect files ────────────────────────────────────────────────────
      let s = performance.now();
      const [allFiles, rootFiles] = await Promise.all([
        walkDir(sourceCodePath),
        fs.readdir(sourceCodePath),
      ]);
      t("walkDir", s);

      const lowerRootFiles = rootFiles.map((f) => f.toLowerCase());
      const normalizedFiles = allFiles.map((f) => f.toLowerCase());

      // ── Run heavy analysis in parallel ───────────────────────────────────
      s = performance.now();
      const [
        codeQuality,
        duplicatePercent,
        repoReadmeContent,
        repoDependencies,
      ] = await Promise.all([
        analyzeCodeQuality(allFiles),
        runJSCPD(sourceCodePath),
        extractReadmes(allFiles),
        extractDependencies(allFiles),
      ]);
      t("analysis + jscpd + readme + deps", s);

      // ── Documentation score /10 ──────────────────────────────────────────
      // เกณฑ์:
      //   README.md (progressive by file size)
      //     > 3,000 B  → +7  (มีเนื้อหาครบ: setup, usage, API, examples)
      //     > 1,000 B  → +5  (อธิบายโปรเจกต์พอเข้าใจได้)
      //     > 200 B    → +3  (มีแค่หัวข้อคร่าวๆ)
      //     มีแต่ว่าง  → +1  (สร้างไว้แต่ไม่ได้เขียน)
      //   LICENSE / LICENSE.md → +2  (ระบุ license ชัดเจน)
      //   CHANGELOG.md / CONTRIBUTING.md → +1  (มี history หรือ guide สำหรับ contributor)
      let docScore = 0;
      const readmeName = rootFiles.find((f) => f.toLowerCase() === "readme.md");
      if (readmeName) {
        const stat = await fs.stat(path.join(sourceCodePath, readmeName));
        if (stat.size > 3000) docScore += 7;
        else if (stat.size > 1000) docScore += 5;
        else if (stat.size > 200) docScore += 3;
        else docScore += 1;
      }
      if (lowerRootFiles.some((f) => f.includes("license"))) docScore += 2;
      if (
        lowerRootFiles.some((f) =>
          ["changelog.md", "contributing.md"].includes(f),
        )
      )
        docScore += 1;

      // ── Architecture score /10 ───────────────────────────────────────────
      // เกณฑ์:
      //   Dependency lock file → +5  (pin version ชัดเจน, build reproducible)
      //     (package-lock.json / yarn.lock / pnpm-lock.yaml / poetry.lock / go.sum)
      //   Dependency manifest เท่านั้น (ไม่มี lock) → +3
      //     (package.json / requirements.txt / go.mod / cargo.toml / pubspec.yaml)
      //   Linter / Formatter config → +3  (enforce code style ทั้งทีม)
      //     (.eslintrc* / .prettierrc* / tox.ini / .pylintrc / golangci.yml)
      //   Code quality / consistency config → +2  (optional แต่ดี)
      //     (.editorconfig / sonar-project.properties)
      let archScore = 0;
      const lockFiles = [
        "package-lock.json",
        "yarn.lock",
        "pnpm-lock.yaml",
        "poetry.lock",
        "go.sum",
      ];
      const manifestFiles = [
        "package.json",
        "requirements.txt",
        "go.mod",
        "cargo.toml",
        "pubspec.yaml",
      ];
      if (lowerRootFiles.some((f) => lockFiles.includes(f))) archScore += 5;
      else if (lowerRootFiles.some((f) => manifestFiles.includes(f)))
        archScore += 3;

      const lintFiles = [
        ".eslintrc",
        ".eslintrc.js",
        ".eslintrc.json",
        ".prettierrc",
        ".prettierrc.js",
        "tox.ini",
        ".pylintrc",
        "golangci.yml",
      ];
      if (lowerRootFiles.some((f) => lintFiles.some((l) => f.includes(l))))
        archScore += 3;
      if (
        lowerRootFiles.some((f) =>
          [".editorconfig", "sonar-project.properties"].includes(f),
        )
      )
        archScore += 2;

      // ── Testing & CI/CD score /15 ────────────────────────────────────────
      let testCiScore = 0;
      const hasTests = normalizedFiles.some(
        (f) =>
          f.includes("/test/") ||
          f.includes("/__tests__/") ||
          f.includes(".spec.") ||
          f.includes(".test."),
      );
      if (hasTests) testCiScore += 8;

      const hasCi = normalizedFiles.some(
        (f) =>
          f.includes(".github/workflows") ||
          f.includes(".gitlab-ci.yml") ||
          f.includes("circleci"),
      );
      if (hasCi) testCiScore += 5;

      const hasDocker = normalizedFiles.some(
        (f) => f.includes("dockerfile") || f.includes("docker-compose"),
      );
      if (hasDocker) testCiScore += 2;

      // ── Clean code score /15 (duplicate penalty) ─────────────────────────
      // Smoother curve: 0% dup = 15, 10% = ~10, 50% = 0
      const cleanScore = clamp(15 - duplicatePercent * 0.3, 0, 15);

      // ── Pull subscores ───────────────────────────────────────────────────
      const effScore = codeQuality.efficiencyScore;
      const secScore = codeQuality.securityScore;
      const habScore = codeQuality.habitScore;
      const stats = codeQuality.stats;

      const finalScore = Math.round(
        docScore +
          archScore +
          testCiScore +
          cleanScore +
          effScore +
          secScore +
          habScore,
      );

      const grade =
        finalScore >= 90
          ? "S"
          : finalScore >= 80
            ? "A"
            : finalScore >= 65
              ? "B"
              : "C";

      const insightMsg = buildInsightMessage(stats);

      const mergedDetailedStats = {
        ...stats,
        readme: repoReadmeContent,
        dependencies: repoDependencies,
      };

      console.log("👉 mergedDetailedStats:", mergedDetailedStats);

      return {
        success: true,
        grade,
        finalScore,
        metrics: {
          documentation_score: `${docScore}/10`,
          architecture_score: `${archScore}/10`,
          testing_cicd_score: `${testCiScore}/15`,
          clean_code_score: `${Math.round(cleanScore)}/15`,
          efficiency_score: `${effScore}/20`,
          security_score: `${secScore}/15`,
          habits_score: `${habScore}/10`,
          detailed_stats: mergedDetailedStats,
          insight: insightMsg,
        },
        raw_scores: {
          docScore,
          archScore,
          testCiScore,
          cleanCodeScore: Math.round(cleanScore),
          efficiencyScore: effScore,
          securityScore: secScore,
          habitScore: habScore,
        },
        detailed_stats: mergedDetailedStats,
        insight: insightMsg,
      };
    } catch (error: any) {
      console.error("Scoring Error:", error.message);
      throw error;
    }
  },

  async getAnalysisResult(userId: string, mongoProjectId: string) {
    const repoGroup = await RepoGroup.findById(mongoProjectId);
    if (!repoGroup) throw new Error("PROJECT_NOT_FOUND");
    if (!repoGroup.isAnalyzed) return { status: "processing" };

    const userProject = await prisma.userProject.findFirst({
      where: { mongoProjectId, userId: Number(userId) },
    });
    if (!userProject) throw new Error("USER_PROJECT_NOT_FOUND");

    const analysisResult = await prisma.project_analysis.findUnique({
      where: { user_project_id: userProject.id },
    });
    if (!analysisResult) throw new Error("ANALYSIS_RESULT_NOT_FOUND");

    return { status: "completed", data: analysisResult };
  },
};

export default ScoreService;
