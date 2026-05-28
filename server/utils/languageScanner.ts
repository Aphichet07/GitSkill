import fs from "fs/promises";
import path from "path";

const EXTENSION_MAP: Record<string, string> = {
  ".ts": "TypeScript",
  ".tsx": "TypeScript",
  ".js": "JavaScript",
  ".jsx": "JavaScript",
  ".py": "Python",
  ".java": "Java",
  ".go": "Go",
  ".html": "HTML",
  ".css": "CSS",
  ".php": "PHP",
  ".cs": "C#",
  ".cpp": "C++",
  ".c": "C",
  ".rb": "Ruby",
  ".rs": "Rust",
  ".sql": "SQL",
};

const IGNORE_DIRS = ["node_modules", ".git", "dist", "build", ".next", "venv", "__pycache__"];

export async function scanLanguageStats(dirPath: string): Promise<Record<string, number>> {
  const stats: Record<string, number> = {};

  async function scanDirectory(currentPath: string) {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      if (IGNORE_DIRS.includes(entry.name)) continue;

      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        await scanDirectory(fullPath);
      } else {
        const ext = path.extname(entry.name).toLowerCase();
        const langName = EXTENSION_MAP[ext];

        if (langName) {
          const fileStat = await fs.stat(fullPath);
          stats[langName] = (stats[langName] || 0) + fileStat.size;
        }
      }
    }
  }

  try {
    await scanDirectory(dirPath);
    return stats;
  } catch (error) {
    console.error("❌ [LanguageScanner] Error:", error);
    return {};
  }
}