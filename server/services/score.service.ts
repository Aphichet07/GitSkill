import util from "util";
import { exec as execCb } from "child_process";
import fs from "fs/promises";
import path from "path";

const exec = util.promisify(execCb);

// ฟังก์ชันช่วยค้นหาไฟล์ทั้งหมด
async function walkDir(
  dir: string,
  fileList: string[] = [],
): Promise<string[]> {
  const files = await fs.readdir(dir);
  for (const file of files) {
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
        await walkDir(filePath, fileList);
      }
    } else {
      fileList.push(filePath.toLowerCase().replace(/\\/g, "/"));
    }
  }
  return fileList;
}

// วิเคราะห์ Big(O), Security, Habits
async function analyzeCodeQuality(allFiles: string[], sourceCodePath: string) {
  let totalAnalyzed = 0;
  let massiveFiles = 0;
  let nestedLoopCount = 0;

  // Security Stats
  let hardcodedSecrets = 0;
  let sqlInjections = 0;

  // Habits Stats
  let totalCodeLines = 0;
  let totalCommentLines = 0;
  let leftoverLogs = 0;

  const codeFiles = allFiles.filter((f) =>
    f.match(/\.(ts|tsx|js|jsx|go|java|cpp|c|cs|php|dart|swift|py)$/),
  );

  for (const file of codeFiles.slice(0, 100)) {
    if (!file) continue;

    try {
      const fullPath = path.join(sourceCodePath, file);
      const rawContent = await fs.readFile(fullPath, "utf-8");
      totalAnalyzed++;

      const lines = rawContent.split("\n");
      totalCodeLines += lines.length;
      if (lines.length > 300) massiveFiles++;

      // --- นับบรรทัด Comment ---
      const commentMatch = rawContent.match(/(\/\/.*|#.*|\/\*[\s\S]*?\*\/)/g);
      if (commentMatch) {
        // นับบรรทัดคร่าวๆ จาก \n ในบล็อก comment
        totalCommentLines += commentMatch.reduce(
          (acc, c) => acc + c.split("\n").length,
          0,
        );
      }

      // --- หา Console.log หรือ Print ที่ลืมลบ ---
      const logMatch = rawContent.match(
        /\b(console\.log|print|fmt\.Println|System\.out\.println)\s*\(/g,
      );
      if (logMatch) leftoverLogs += logMatch.length;

      // ---  จับ Hardcoded Secrets (รหัสผ่านหลุด) ---
      // มองหาคำว่า password, secret, token = "..."
      const secretMatch = rawContent.match(
        /(password|secret|api_key|apikey|token)\s*[:=]\s*['"][a-zA-Z0-9\-_]{8,}['"]/gi,
      );
      if (secretMatch) hardcodedSecrets += secretMatch.length;

      // ---  จับ SQL Injection (เอาตัวแปรไปต่อ String SQL ตรงๆ) ---
      const sqlMatch = rawContent.match(
        /(SELECT|INSERT|UPDATE|DELETE).*?(WHERE|VALUES).*?['"]\s*\+/gi,
      );
      if (sqlMatch) sqlInjections += sqlMatch.length;

      // --- วิเคราะห์ Big(O) แบบแกะ Scope ปีกกา ---
      // ล้าง String & Comment ออกก่อนเช็ค Scope ป้องกัน False Positive
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
          (depth) => depth <= currentScopeDepth,
        );
      }
    } catch (e) {
      /* ข้ามไฟล์ที่อ่านไม่ได้ */
    }
  }

  // --- คำนวณคะแนนประสิทธิภาพ (20 แต้ม) ---
  let efficiencyScore = 20;
  efficiencyScore -= Math.min(10, massiveFiles * 3); // ไฟล์ยาวหักไฟล์ละ 3 แต้ม
  efficiencyScore -= Math.min(10, nestedLoopCount * 3); // ลูปซ้อนลูปหักที่ละ 3 แต้ม

  // --- คำนวณคะแนน Security (15 แต้ม) ---
  let securityScore = 15;
  securityScore -= Math.min(10, hardcodedSecrets * 5); // รหัสหลุด หักจุดละ 5 แต้ม
  securityScore -= Math.min(5, sqlInjections * 5); // เสี่ยงโดนแฮก หัก 5 แต้ม

  // --- คำนวณคะแนน Habits (15 แต้ม) ---
  let habitScore = 15;
  const commentRatio =
    totalCodeLines > 0 ? (totalCommentLines / totalCodeLines) * 100 : 0;

  // 5% - 25% ถือว่ากำลังสวย
  if (commentRatio < 2) habitScore -= 5; // ไม่ค่อยอธิบาย
  if (commentRatio > 35) habitScore -= 3; // คอมเมนต์รกเกิน

  // ลืมลบ Print หักจุดละ 1 แต้ม
  habitScore -= Math.min(7, leftoverLogs * 1);

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

// ฟังก์ชันหลัก
const ScoreService = {
  async analyzeProject(sourceCodePath: string) {
    try {
      console.log(`เริ่มวิเคราะห์ที่: ${sourceCodePath}`);

      const allFiles = await walkDir(sourceCodePath);
      const rootFiles = await fs.readdir(sourceCodePath);
      const lowerRootFiles = rootFiles.map((f) => f.toLowerCase());
      const normalizedFiles = allFiles.map((f) => f.replace(/\\/g, "/"));

      let docScore = 0; // 10
      let archScore = 0; // 10
      let testCiScore = 0; // 15
      let cleanScore = 15; // 15

      const codeQuality = await analyzeCodeQuality(allFiles, sourceCodePath);

      // --- Docs (10 แต้ม) ---
      const readmeName =
        rootFiles.find((f) => f.toLowerCase() === "readme.md") || "";
      if (readmeName !== "") {
        const readmeStat = await fs.stat(path.join(sourceCodePath, readmeName));
        docScore += readmeStat.size > 200 ? 7 : 3;
      }
      if (lowerRootFiles.some((f) => f.includes("license"))) docScore += 3;

      // --- Architecture (10 แต้ม) ---
      // เช็คว่ามีไฟล์ล็อคเวอร์ชันหรือมีแค่ไฟล์คอนฟิกเฉยๆ
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
      )
        archScore += 6;
      else if (
        lowerRootFiles.some((f) =>
          ["package.json", "requirements.txt", "go.mod"].includes(f),
        )
      )
        archScore += 3;
      if (
        lowerRootFiles.some(
          (f) =>
            f.includes(".eslintrc") ||
            f.includes(".prettierrc") ||
            f.includes("tox.ini"),
        )
      )
        archScore += 4;

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

      // --- Clean Code / Duplication (15 แต้ม) ---
      let duplicatePercent = 0;
      const reportPath = path.join(sourceCodePath, "jscpd-report.json");
      try {
        await exec(
          `npx jscpd "${sourceCodePath}" --reporters json --output "${sourceCodePath}" --silent --ignore "**/*.min.js,**/node_modules/**,**/dist/**,**/.git/**"`,
        );
        const report = JSON.parse(await fs.readFile(reportPath, "utf-8"));
        duplicatePercent = report.statistics.total.percentage || 0;
        cleanScore = Math.max(0, 15 - duplicatePercent * 1.5);
      } catch (e) {
        cleanScore = 15;
      }

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
