import util from "util";
import { exec as execCb } from "child_process";
import fs from "fs/promises";
import path from "path";
import { jscpd } from 'jscpd';
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

async function walkDir(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  const paths = await Promise.all(
    entries.map(async (entry) => {
      const filePath = path.join(dir, entry.name).replace(/\\/g, "/");
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) return walkDir(filePath);
        return [];
      }
      return [filePath];
    }),
  );
  return paths.flat();
}

async function analyzeFile(fullPath: string): Promise<FileAnalysisResult> {
  const zero: FileAnalysisResult = {
    totalCodeLines: 0,
    totalCommentLines: 0,
    massiveFiles: 0,
    nestedLoopCount: 0,
    hardcodedSecrets: 0,
    sqlInjections: 0,
    leftoverLogs: 0,
  };

  try {
    const rawContent = await fs.readFile(fullPath, "utf-8");
    const lines = rawContent.split("\n");
    const totalCodeLines = lines.length;
    const massiveFiles = totalCodeLines > 300 ? 1 : 0;

    const commentMatch = rawContent.match(/(\/\/.*|#.*|\/\*[\s\S]*?\*\/)/g);
    const totalCommentLines = commentMatch
      ? commentMatch.reduce((acc, c) => acc + c.split("\n").length, 0)
      : 0;

    const logMatch = rawContent.match(
      /\b(console\.log|print|fmt\.Println|System\.out\.println)\s*\(/g,
    );
    const leftoverLogs = logMatch?.length ?? 0;

    const secretMatch = rawContent.match(
      /(password|secret|api_key|apikey|token)\s*[:=]\s*['"][a-zA-Z0-9\-_]{8,}['"]/gi,
    );
    const hardcodedSecrets = secretMatch?.length ?? 0;

    const sqlMatch = rawContent.match(
      /(SELECT|INSERT|UPDATE|DELETE).*?(WHERE|VALUES).*?['"]\s*\+/gi,
    );
    const sqlInjections = sqlMatch?.length ?? 0;

    // --- วิเคราะห์ Big(O) ---
    const cleanContent = rawContent
      .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "")
      .replace(/(["'`])(?:(?=(\\?))\2.)*?\1/g, "");

    const cleanLines = cleanContent.split("\n");
    let currentScopeDepth = 0;
    let activeLoopDepths: number[] = [];
    let nestedLoopCount = 0;

    for (const line of cleanLines) {
      if (!line) continue;

      const hasLoop =
        /\b(for|while)\b/.test(line) ||
        /\.(map|forEach|filter|reduce)\s*\(/.test(line);

      if (hasLoop) activeLoopDepths.push(currentScopeDepth);

      const openBraces = (line.match(/\{/g) || []).length;
      const closeBraces = (line.match(/\}/g) || []).length;

      currentScopeDepth += openBraces;

      if (activeLoopDepths.length >= 2) {
        nestedLoopCount++;
        activeLoopDepths.pop();
      }

      currentScopeDepth -= closeBraces;
      activeLoopDepths = activeLoopDepths.filter((d) => d <= currentScopeDepth);
    }

    return {
      totalCodeLines,
      totalCommentLines,
      massiveFiles,
      nestedLoopCount,
      hardcodedSecrets,
      sqlInjections,
      leftoverLogs,
    };
  } catch {
    return zero;
  }
}

interface FileAnalysisResult {
  totalCodeLines: number;
  totalCommentLines: number;
  massiveFiles: number;
  nestedLoopCount: number;
  hardcodedSecrets: number;
  sqlInjections: number;
  leftoverLogs: number;
}

const CODE_FILE_REGEX =
  /\.(ts|tsx|js|jsx|go|java|cpp|c|cs|php|dart|swift|py)$/i;

async function analyzeCodeQuality(allFiles: string[]) {
  const codeFiles = allFiles
    .filter((f) => CODE_FILE_REGEX.test(f))
    .slice(0, 100);

  const results = await Promise.all(codeFiles.map(analyzeFile));

  const totals = results.reduce(
    (acc, r) => ({
      totalCodeLines: acc.totalCodeLines + r.totalCodeLines,
      totalCommentLines: acc.totalCommentLines + r.totalCommentLines,
      massiveFiles: acc.massiveFiles + r.massiveFiles,
      nestedLoopCount: acc.nestedLoopCount + r.nestedLoopCount,
      hardcodedSecrets: acc.hardcodedSecrets + r.hardcodedSecrets,
      sqlInjections: acc.sqlInjections + r.sqlInjections,
      leftoverLogs: acc.leftoverLogs + r.leftoverLogs,
    }),
    {
      totalCodeLines: 0,
      totalCommentLines: 0,
      massiveFiles: 0,
      nestedLoopCount: 0,
      hardcodedSecrets: 0,
      sqlInjections: 0,
      leftoverLogs: 0,
    },
  );

  const efficiencyScore =
    20 -
    Math.min(10, totals.massiveFiles * 3) -
    Math.min(10, totals.nestedLoopCount * 3);

  const securityScore =
    15 -
    Math.min(10, totals.hardcodedSecrets * 5) -
    Math.min(5, totals.sqlInjections * 5);

  let habitScore = 15 - Math.min(7, totals.leftoverLogs);

  const commentRatio =
    totals.totalCodeLines > 0
      ? (totals.totalCommentLines / totals.totalCodeLines) * 100
      : 0;

  if (commentRatio < 2) habitScore -= 5;
  if (commentRatio > 35) habitScore -= 3;

  return {
    efficiencyScore: Math.max(0, Math.round(efficiencyScore)),
    securityScore: Math.max(0, Math.round(securityScore)),
    habitScore: Math.max(0, Math.round(habitScore)),
    stats: {
      massiveFiles: totals.massiveFiles,
      nestedLoopsO2: totals.nestedLoopCount,
      hardcodedSecrets: totals.hardcodedSecrets,
      sqlInjections: totals.sqlInjections,
      leftoverLogs: totals.leftoverLogs,
      commentRatioPercent: Number(commentRatio.toFixed(1)),
    },
  };
}

async function runJSCPD(sourceCodePath: string): Promise<number> {
  const reportPath = path.join(sourceCodePath, "jscpd-report.json");
  try {
    await exec(
      `npx --no jscpd "${sourceCodePath}" --reporters json --output "${sourceCodePath}" --silent --ignore "**/*.min.js,**/node_modules/**,**/dist/**,**/.git/**"`,
      { timeout: 30_000 },
    );
    const report = JSON.parse(await fs.readFile(reportPath, "utf-8"));
    return report.statistics?.total?.percentage ?? 0;
  } catch {
    return 0;
  }
}

const ScoreService = {
  async analyzeProject(sourceCodePath: string) {
    try {
      console.log(`เริ่มวิเคราะห์ที่: ${sourceCodePath}`);
      const t = (label: string, start: number) =>
        console.log(
          `⏱ ${label}: ${((performance.now() - start) / 1000).toFixed(2)}s`,
        );

      let s = performance.now();
      const [allFiles, rootFiles] = await Promise.all([
        walkDir(sourceCodePath),
        fs.readdir(sourceCodePath),
      ]);

      const lowerRootFiles = rootFiles.map((f) => f.toLowerCase());
      const normalizedFiles = allFiles.map((f) => f.toLowerCase());

      let docScore = 0;
      let archScore = 0;
      let testCiScore = 0;
      let cleanScore = 15;
      s = performance.now();
      const [codeQuality, duplicatePercent] = await Promise.all([
        analyzeCodeQuality(allFiles),
        runJSCPD(sourceCodePath),
      ]);
      t("analyzeCodeQuality + jscpd", s);
      cleanScore = Math.max(0, 15 - duplicatePercent * 1.5);

      // --- Docs (10 แต้ม) ---
      const readmeName = rootFiles.find((f) => f.toLowerCase() === "readme.md");
      if (readmeName) {
        const readmeStat = await fs.stat(path.join(sourceCodePath, readmeName));
        docScore += readmeStat.size > 200 ? 7 : 3;
      }
      if (lowerRootFiles.some((f) => f.includes("license"))) docScore += 3;

      // --- Architecture (10 แต้ม) ---
      if (
        lowerRootFiles.some((f) =>
          [
            "package-lock.json",
            "yarn.lock",
            "pnpm-lock.yaml",
            "poetry.lock",
            "go.sum",
          ].includes(f),
        )
      ) {
        archScore += 6;
      } else if (
        lowerRootFiles.some((f) =>
          ["package.json", "requirements.txt", "go.mod"].includes(f),
        )
      ) {
        archScore += 3;
      }

      if (
        lowerRootFiles.some(
          (f) =>
            f.includes(".eslintrc") ||
            f.includes(".prettierrc") ||
            f.includes("tox.ini"),
        )
      ) {
        archScore += 4;
      }

      // --- Test & CI/CD (15 แต้ม) ---
      if (
        normalizedFiles.some(
          (f) =>
            f.includes("/test/") ||
            f.includes(".spec.") ||
            f.includes(".test."),
        )
      )
        testCiScore += 8;
      if (
        normalizedFiles.some(
          (f) =>
            f.includes(".github/workflows") ||
            f.includes(".gitlab-ci.yml") ||
            f.includes("dockerfile"),
        )
      )
        testCiScore += 7;

      // --- สรุปผล ---
      const finalScore = Math.round(
        docScore +
          archScore +
          testCiScore +
          cleanScore +
          codeQuality.efficiencyScore +
          codeQuality.securityScore +
          codeQuality.habitScore,
      );

      let grade =
        finalScore >= 90
          ? "S"
          : finalScore >= 80
            ? "A"
            : finalScore >= 65
              ? "B"
              : "C";

      let insightMsg = "โปรเจกต์คุณภาพระดับ Enterprise โค้ดคลีนและปลอดภัยมาก";
      const { stats } = codeQuality;

      if (stats.hardcodedSecrets > 0)
        insightMsg = `อันตราย! พบรหัสผ่านหรือ Token หลุดอยู่ในโค้ด ${stats.hardcodedSecrets} จุด กรุณาใช้ .env ด่วน`;
      else if (stats.nestedLoopsO2 > 3)
        insightMsg = `ระวังเรื่อง Performance! พบลูปซ้อนลูป ${stats.nestedLoopsO2} จุด อาจทำให้โปรแกรมรันช้าเมื่อข้อมูลเยอะ`;
      else if (stats.leftoverLogs > 10)
        insightMsg = `โค้ดทำงานได้ดี แต่ลืมลบ console.log() ทิ้งไปถึง ${stats.leftoverLogs} จุด`;
      else if (stats.commentRatioPercent < 2)
        insightMsg = `โค้ดอ่านยากไปนิด (คอมเมนต์น้อยกว่า 2%) ควรเพิ่มคำอธิบายฟังก์ชันให้เพื่อนร่วมทีมด้วย`;

      return {
        success: true,
        grade,
        finalScore,
        metrics: {
          documentation_score: `${docScore}/10`,
          architecture_score: `${archScore}/10`,
          testing_cicd_score: `${testCiScore}/15`,
          clean_code_score: `${Math.round(cleanScore)}/15`,
          efficiency_score: `${codeQuality.efficiencyScore}/20`,
          security_score: `${codeQuality.securityScore}/15`,
          habits_score: `${codeQuality.habitScore}/15`,
          detailed_stats: codeQuality.stats,
          insight: insightMsg,
        },
        raw_scores: {
          docScore,
          archScore,
          testCiScore,
          cleanCodeScore: Math.round(cleanScore),
          efficiencyScore: codeQuality.efficiencyScore,
          securityScore: codeQuality.securityScore,
          habitScore: codeQuality.habitScore,
        },
        detailed_stats: codeQuality.stats,
        insight: insightMsg,
      };
    } catch (error: any) {
      console.error("Scoring Error:", error.message);
      throw error;
    }
  },
};

export default ScoreService;
