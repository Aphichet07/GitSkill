export interface AnalysisResultData {
  duplicatePercent: number;
  duplicateScore: number;
  lintScore: number;
  finalScore: number;
}

export interface AnalysisResponse {
  success: boolean;
  data: AnalysisResultData;
}

export interface ExecError extends Error {
  code?: number;
  stdout: string;
  stderr: string;
}