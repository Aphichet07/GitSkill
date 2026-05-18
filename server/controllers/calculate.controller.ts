import type { Request, Response } from 'express';
import fs from 'fs/promises';
import { analyzeRepo } from '../services/calculate.service.js';

interface AnalyzeRequestBody {
  githubUrl: string;
  language: string;
}

export const startAnalysis = async (
  req: Request<object, object, AnalyzeRequestBody>, 
  res: Response
): Promise<void> => {
  const { githubUrl, language } = req.body;
  let tempFolderPath = '';

  if (!githubUrl || !language) {
    res.status(400).json({ message: "githubUrl and language are required" });
    return;
  }

  try {
    tempFolderPath = '/tmp/dummy-repo-path'; 

    const analysisResult = await analyzeRepo(tempFolderPath, language);

    res.status(200).json({
      message: "Analysis complete",
      result: analysisResult.data
    });

  } catch (error: unknown) {
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    res.status(500).json({ message: "Something went wrong", error: errorMessage });
    
  } finally {
    if (tempFolderPath) {
      try {
        await fs.rm(tempFolderPath, { recursive: true, force: true });
        console.log(`Cleaned up: ${tempFolderPath}`);
      } catch (rmError) {
        console.error('Failed to clean up temp folder:', rmError);
      }
    }
  }
};