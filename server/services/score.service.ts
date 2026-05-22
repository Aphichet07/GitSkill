import util from "util";
import { exec as execCb } from "child_process";
import fs from "fs/promises";
import path from "path";

const exec = util.promisify(execCb);

async function walkDir(dir: string): Promise<string[]> {
  const files = await fs.readdir(dir);
  
  const paths = await Promise.all(
    files.map(async (file) => {
      const filePath = path.join(dir, file);
      const stat = await fs.stat(filePath);
      
      if (stat.isDirectory()) {
        if (
          ![
            "node_modules",
            "dist",
            "build",
            ".git",
            "venv",
            "__pycache__",
            "target",
            "coverage",
          ].includes(file)
        ) {
          return walkDir(filePath); 
        }
        return [];
      } else {
        return [filePath.replace(/\\/g, "/")]; 
      }
    })
  );
  
  return paths.flat();
}

async function analyzeCodeQuality(allFiles: string[]) {
  let totalAnalyzed = 0;
  let massiveFiles = 0;
  let nestedLoopCount = 0;
  let hardcodedSecrets = 0;
  let sqlInjections = 0;
  let totalCodeLines = 0;
  let totalCommentLines = 0;
  let leftoverLogs = 0;

  const codeFiles = allFiles.filter((f) =>
    f.toLowerCase().match(/\.(ts|tsx|js|jsx|go|java|cpp|c|cs|php|dart|swift|py)$/)
  );

  await Promise.all(
    codeFiles.slice(0, 100).map(async (fullPath) => {
      try {
        const rawContent = await fs.readFile(fullPath, "utf-8");
        
        totalAnalyzed++;
        const lines = rawContent.split("\n");
        totalCodeLines += lines.length;
        if (lines.length > 300) massiveFiles++;

        const commentMatch = rawContent.match(/(\/\/.*|#.*|\/\*[\s\S]*?\*\/)/g);
        if (commentMatch) {
          totalCommentLines += commentMatch.reduce(
            (acc, c) => acc + c.split("\n").length,
            0
          );
        }

        // --- หา Console.log หรือ Print ที่ลืมลบ ---
        const logMatch = rawContent.match(
          /\b(console\.log|print|fmt\.Println|System\.out\.println)\s*\(/g
        );
        if (logMatch) leftoverLogs += logMatch.length;

        // --- จับ Hardcoded Secrets ---
        const secretMatch = rawContent.match(
          /(password|secret|api_key|apikey|token)\s*[:=]\s*['"][a-zA-Z0-9\-_]{8,}['"]/gi
        );
        if (secretMatch) hardcodedSecrets += secretMatch.length;

        // --- จับ SQL Injection ---
        const sqlMatch = rawContent.match(
          /(SELECT|INSERT|UPDATE|DELETE).*?(WHERE|VALUES).*?['"]\s*\+/gi
        );
        if (sqlMatch) sqlInjections += sqlMatch.length;

        // --- วิเคราะห์ Big(O) ---
        let cleanContent = rawContent
          .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "")
          .replace(/(["'`])(?:(?=(\\?))\2.)*?\1/g, "");
        
        const cleanLines = cleanContent.split("\n");
        let currentScopeDepth = 0;
        let activeLoopDepths: number[] = [];

        for (let i = 0; i < cleanLines.length; i++) {
          const line = cleanLines[i];
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
          activeLoopDepths = activeLoopDepths.filter(
            (depth) => depth <= currentScopeDepth
          );
        }
      } catch (e) {
        /* ข้ามไฟล์ที่อ่านไม่ได้ */
      }
    })
  );

  let efficiencyScore = 20 - Math.min(10, massiveFiles * 3) - Math.min(10, nestedLoopCount * 3);
  let securityScore = 15 - Math.min(10, hardcodedSecrets * 5) - Math.min(5, sqlInjections * 5);
  let habitScore = 15 - Math.min(7, leftoverLogs * 1);
  
  const commentRatio = totalCodeLines > 0 ? (totalCommentLines / totalCodeLines) * 100 : 0;
  if (commentRatio < 2) habitScore -= 5;
  if (commentRatio > 35) habitScore -= 3;

  return {
    efficiencyScore: Math.max(0, Math.round(efficiencyScore)),
    securityScore: Math.max(0, Math.round(securityScore)),
    habitScore: Math.max(0, Math.round(habitScore)),
    stats: {
      massiveFiles,
      nestedLoopsO2: nestedLoopCount,
      hardcodedSecrets,
      sqlInjections,
      leftoverLogs,
      commentRatioPercent: Number(commentRatio.toFixed(1)),
    },
  };
}

async function runJSCPD(sourceCodePath: string) {
  const reportPath = path.join(sourceCodePath, "jscpd-report.json");
  try {
    await exec(
      `npx --no jscpd "${sourceCodePath}" --reporters json --output "${sourceCodePath}" --silent --ignore "**/*.min.js,**/node_modules/**,**/dist/**,**/.git/**"`
    );
    const report = JSON.parse(await fs.readFile(reportPath, "utf-8"));
    return report.statistics.total.percentage || 0;
  } catch (e) {
    return 0; 
  }
}


const ScoreService = {
  async analyzeProject(sourceCodePath: string) {
    try {
      console.log(`เริ่มวิเคราะห์ที่: ${sourceCodePath}`);

      const [allFiles, rootFiles] = await Promise.all([
        walkDir(sourceCodePath),
        fs.readdir(sourceCodePath)
      ]);

      const lowerRootFiles = rootFiles.map((f) => f.toLowerCase());
      const normalizedFiles = allFiles.map((f) => f.toLowerCase());

      let docScore = 0;
      let archScore = 0;
      let testCiScore = 0;
      let cleanScore = 15;

      const [codeQuality, duplicatePercent] = await Promise.all([
        analyzeCodeQuality(allFiles),
        runJSCPD(sourceCodePath)
      ]);

      cleanScore = Math.max(0, 15 - duplicatePercent * 1.5);

      // --- Docs (10 แต้ม) ---
      const readmeName = rootFiles.find((f) => f.toLowerCase() === "readme.md");
      if (readmeName) {
        const readmeStat = await fs.stat(path.join(sourceCodePath, readmeName));
        docScore += readmeStat.size > 200 ? 7 : 3;
      }
      if (lowerRootFiles.some((f) => f.includes("license"))) docScore += 3;

      // --- Architecture (10 แต้ม) ---
      if (lowerRootFiles.some((f) => ["package-lock.json", "yarn.lock", "pnpm-lock.yaml", "poetry.lock", "go.sum"].includes(f))) {
        archScore += 6;
      } else if (lowerRootFiles.some((f) => ["package.json", "requirements.txt", "go.mod"].includes(f))) {
        archScore += 3;
      }
      
      if (lowerRootFiles.some((f) => f.includes(".eslintrc") || f.includes(".prettierrc") || f.includes("tox.ini"))) {
        archScore += 4;
      }

      // --- Test & CI/CD (15 แต้ม) ---
      if (normalizedFiles.some((f) => f.includes("/test/") || f.includes(".spec.") || f.includes(".test."))) testCiScore += 8;
      if (normalizedFiles.some((f) => f.includes(".github/workflows") || f.includes(".gitlab-ci.yml") || f.includes("dockerfile"))) testCiScore += 7;

      // --- สรุปผล ---
      const finalScore = Math.round(
        docScore + archScore + testCiScore + cleanScore +
        codeQuality.efficiencyScore + codeQuality.securityScore + codeQuality.habitScore
      );

      let grade = finalScore >= 90 ? "S" : finalScore >= 80 ? "A" : finalScore >= 65 ? "B" : "C";

      let insightMsg = "โปรเจกต์คุณภาพระดับ Enterprise โค้ดคลีนและปลอดภัยมาก";
      const { stats } = codeQuality;

      if (stats.hardcodedSecrets > 0) insightMsg = `อันตราย! พบรหัสผ่านหรือ Token หลุดอยู่ในโค้ด ${stats.hardcodedSecrets} จุด กรุณาใช้ .env ด่วน`;
      else if (stats.nestedLoopsO2 > 3) insightMsg = `ระวังเรื่อง Performance! พบลูปซ้อนลูป ${stats.nestedLoopsO2} จุด อาจทำให้โปรแกรมรันช้าเมื่อข้อมูลเยอะ`;
      else if (stats.leftoverLogs > 10) insightMsg = `โค้ดทำงานได้ดี แต่ลืมลบ console.log() ทิ้งไปถึง ${stats.leftoverLogs} จุด`;
      else if (stats.commentRatioPercent < 2) insightMsg = `โค้ดอ่านยากไปนิด (คอมเมนต์น้อยกว่า 2%) ควรเพิ่มคำอธิบายฟังก์ชันให้เพื่อนร่วมทีมด้วย`;

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