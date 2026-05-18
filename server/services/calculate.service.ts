import util from 'util';
import { exec as execCb } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import type { AnalysisResponse, ExecError } from '../types/analysis.type.js'; 

const exec = util.promisify(execCb);

export const analyzeRepo = async (
  extractedFolderPath: string,
  language: string
): Promise<AnalysisResponse> => {
  try {
    let duplicatePercent = 0;
    let lintScore = 50;

    // ตรวจหาโค้ดซ้ำซ้อน
    console.log('Running jscpd...');
    try {
      const reportPath = path.join(extractedFolderPath, 'jscpd-report.json');
      await exec(`npx jscpd ${extractedFolderPath} --reporters json --output ${extractedFolderPath}`);
      
      // Eอ่านไฟล์ JSON ด้วย fs.readFile 
      const jscpdDataRaw = await fs.readFile(reportPath, 'utf-8');
      const jscpdData = JSON.parse(jscpdDataRaw);
      
      duplicatePercent = jscpdData.statistics.total.percentage;
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.warn('jscpd warning:', err.message);
      }
    }

    // ตรวจ Linter ตามภาษา
    if (language === 'TypeScript' || language === 'JavaScript') {
      console.log('Running ESLint...');
      try {
        const { stdout } = await exec(`npx eslint ${extractedFolderPath}/**/*.ts --format json`);
        const eslintResults = JSON.parse(stdout);
        
        let errors = 0;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        eslintResults.forEach((file: any) => errors += file.errorCount);
        
        lintScore = Math.max(0, 50 - errors);
      } catch (err: unknown) {
        // ทำ Type Assertion เพื่อบอก TS ว่าตัวแปรนี้มี .stdout
        const execErr = err as ExecError;
        
        if (execErr.stdout) {
          try {
            const eslintResults = JSON.parse(execErr.stdout);
            let errors = 0;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            eslintResults.forEach((file: any) => errors += file.errorCount);
            lintScore = Math.max(0, 50 - errors);
          } catch (parseErr) {
             console.error('Failed to parse ESLint output', parseErr);
          }
        }
      }
    }

    // รวมคะแนน
    const duplicateScore = Math.max(0, 50 - (duplicatePercent * 2));
    const finalScore = duplicateScore + lintScore;

    return {
      success: true,
      data: {
        duplicatePercent,
        duplicateScore,
        lintScore,
        finalScore
      }
    };

  } catch (error: unknown) {
    console.error('Analysis failed:', error);
    throw error;
  }
};